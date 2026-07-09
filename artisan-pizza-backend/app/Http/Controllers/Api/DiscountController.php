<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Discount::with('creator')->orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'promo_code'  => 'required|string|max:50|unique:discounts,promo_code',
            'type'        => 'required|in:fixed,percent',
            'value'       => 'required|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
            'expires_at'  => 'nullable|date',
        ]);

        $data['created_by'] = $request->user()->id;

        $discount = Discount::create($data);

        return response()->json($discount->load('creator'), 201);
    }

    public function show(Discount $discount): JsonResponse
    {
        return response()->json($discount->load('creator'));
    }

    public function update(Request $request, Discount $discount): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'promo_code'  => 'sometimes|string|max:50|unique:discounts,promo_code,' . $discount->id,
            'type'        => 'sometimes|in:fixed,percent',
            'value'       => 'sometimes|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
            'expires_at'  => 'nullable|date',
        ]);

        $discount->update($data);

        return response()->json($discount->load('creator'));
    }

    public function destroy(Discount $discount): JsonResponse
    {
        $discount->delete();
        return response()->json(['message' => 'Discount deleted.']);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $discount = Discount::where('promo_code', strtoupper($request->code))->first();

        if (!$discount || !$discount->isValid()) {
            return response()->json(['message' => 'Invalid or expired discount code.'], 422);
        }

        return response()->json($discount);
    }
}
