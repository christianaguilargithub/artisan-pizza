<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InventoryItemController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = InventoryItem::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        if ($request->boolean('low_stock')) {
            $query->where('low_stock_threshold', '>', 0)
                  ->whereColumn('quantity', '<=', 'low_stock_threshold');
        }

        return InventoryItemResource::collection($query->paginate(15));
    }

    public function store(StoreInventoryItemRequest $request): JsonResponse
    {
        $data           = $request->validated();
        $data['author'] = $request->user()->id;

        return (new InventoryItemResource(InventoryItem::create($data)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(InventoryItem $inventoryItem): InventoryItemResource
    {
        return new InventoryItemResource($inventoryItem->load('products'));
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem): InventoryItemResource
    {
        $inventoryItem->update($request->validated());

        return new InventoryItemResource($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->delete();

        return response()->json(['message' => 'Inventory item deleted.']);
    }
}
