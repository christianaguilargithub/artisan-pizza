<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'opening_cash'  => (float) $this->opening_cash,
            'closing_cash'  => $this->closing_cash !== null ? (float) $this->closing_cash : null,
            'expected_cash' => $this->expected_cash !== null ? (float) $this->expected_cash : null,
            'total_sales'   => (float) $this->total_sales,
            'total_orders'  => $this->total_orders,
            'status'        => $this->status,
            'notes'         => $this->notes,
            'opened_at'     => $this->opened_at,
            'closed_at'     => $this->closed_at,
            'user'          => new UserResource($this->whenLoaded('user')),
            'orders'        => OrderResource::collection($this->whenLoaded('orders')),
        ];
    }
}
