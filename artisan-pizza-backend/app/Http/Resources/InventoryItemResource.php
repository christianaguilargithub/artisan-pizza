<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'unit'                => $this->unit,
            'quantity'            => (float) $this->quantity,
            'low_stock_threshold' => (float) $this->low_stock_threshold,
            'is_low_stock'        => $this->is_low_stock,
            'author'              => $this->author,
            'created_at'          => $this->created_at,
            'products'            => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
