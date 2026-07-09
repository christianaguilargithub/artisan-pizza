<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        if ($request->boolean('low_stock')) {
            $query->where('low_stock_threshold', '>', 0)
                  ->whereColumn('quantity', '<=', 'low_stock_threshold');
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'unit'                => 'required|string|max:50',
            'quantity'            => 'required|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
        ]);

        $data['author'] = $request->user()->id;

        return response()->json(InventoryItem::create($data), 201);
    }

    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        return response()->json($inventoryItem->load('products'));
    }

    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'unit'                => 'sometimes|string|max:50',
            'quantity'            => 'sometimes|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
        ]);

        $inventoryItem->update($data);

        return response()->json($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->delete();
        return response()->json(['message' => 'Inventory item deleted.']);
    }
}
