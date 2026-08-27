<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection(
            Product::with('category', 'inventoryItems')->paginate(15)
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        unset($data['image']);
        $data['author'] = $request->user()->id;

        $product = Product::create($data);

        return (new ProductResource($product->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category', 'inventoryItems'));
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        unset($data['image']);
        $product->update($data);

        return new ProductResource($product->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function attachInventory(Request $request, Product $product): ProductResource
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'qty_used'          => 'required|integer|min:1',
        ]);

        $product->inventoryItems()->attach($data['inventory_item_id'], [
            'qty_used' => $data['qty_used'],
            'author'   => $request->user()->id,
        ]);

        return new ProductResource($product->load('inventoryItems'));
    }

    public function detachInventory(Product $product, int $inventoryItemId): JsonResponse
    {
        $product->inventoryItems()->detach($inventoryItemId);

        return response()->json(['message' => 'Inventory item detached.']);
    }
}
