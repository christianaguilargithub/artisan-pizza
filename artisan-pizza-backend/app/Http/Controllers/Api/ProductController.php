<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Product::with('category', 'inventoryItems')->paginate(15)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
        ]);

        $data['author'] = $request->user()->id;

        $product = Product::create($data);

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('category', 'inventoryItems'));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
        ]);

        $product->update($data);

        return response()->json($product->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function attachInventory(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'qty_used'          => 'required|integer|min:1',
        ]);

        $product->inventoryItems()->attach($data['inventory_item_id'], [
            'qty_used' => $data['qty_used'],
            'author'   => $request->user()->id,
        ]);

        return response()->json($product->load('inventoryItems'));
    }

    public function detachInventory(Product $product, int $inventoryItemId): JsonResponse
    {
        $product->inventoryItems()->detach($inventoryItemId);

        return response()->json(['message' => 'Inventory item detached.']);
    }
}
