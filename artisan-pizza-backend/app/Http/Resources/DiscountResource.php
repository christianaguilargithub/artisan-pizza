<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'promo_code'  => $this->promo_code,
            'type'        => $this->type,
            'value'       => (float) $this->value,
            'usage_limit' => $this->usage_limit,
            'usage_count' => $this->usage_count,
            'is_active'   => $this->is_active,
            'expires_at'  => $this->expires_at,
            'creator'     => new UserResource($this->whenLoaded('creator')),
            'created_at'  => $this->created_at,
        ];
    }
}
