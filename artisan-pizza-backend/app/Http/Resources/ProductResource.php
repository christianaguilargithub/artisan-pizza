<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'price'           => (float) $this->price,
            'image_url'       => $this->image_url,
            'author'          => $this->author,
            'category'        => new CategoryResource($this->whenLoaded('category')),
            'inventory_items' => InventoryItemResource::collection($this->whenLoaded('inventoryItems')),
            'created_at'      => $this->created_at,
        ];
    }
}
