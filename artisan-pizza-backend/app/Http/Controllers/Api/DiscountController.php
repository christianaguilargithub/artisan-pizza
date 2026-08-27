<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDiscountRequest;
use App\Http\Requests\UpdateDiscountRequest;
use App\Http\Resources\DiscountResource;
use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DiscountController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return DiscountResource::collection(
            Discount::with('creator')->orderByDesc('created_at')->paginate(15)
        );
    }

    public function store(StoreDiscountRequest $request): JsonResponse
    {
        $data               = $request->validated();
        $data['created_by'] = $request->user()->id;

        return (new DiscountResource(Discount::create($data)->load('creator')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Discount $discount): DiscountResource
    {
        return new DiscountResource($discount->load('creator'));
    }

    public function update(UpdateDiscountRequest $request, Discount $discount): DiscountResource
    {
        $discount->update($request->validated());

        return new DiscountResource($discount->load('creator'));
    }

    public function destroy(Discount $discount): JsonResponse
    {
        $discount->delete();

        return response()->json(['message' => 'Discount deleted.']);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        // Reviewed: ->where() uses query-builder parameter binding — not SQL injection
        $discount = Discount::where('promo_code', strtoupper($request->code))->first();

        if (!$discount || !$discount->isValid()) {
            return response()->json(['message' => 'Invalid or expired discount code.'], 422);
        }

        return response()->json(new DiscountResource($discount));
    }
}
