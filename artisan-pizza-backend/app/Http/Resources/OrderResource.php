<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'queue_number'    => $this->queue_number,
            'order_source'    => $this->order_source,
            'status'          => $this->status,
            'total_amount'    => (float) $this->total_amount,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount'      => (float) $this->tax_amount,
            'notes'           => $this->notes,
            'called_at'       => $this->called_at,
            'refunded_at'     => $this->refunded_at,
            'created_at'      => $this->created_at,
            'user'            => new UserResource($this->whenLoaded('user')),
            'discount'        => new DiscountResource($this->whenLoaded('discount')),
            'order_items'     => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'payment'         => new PaymentResource($this->whenLoaded('payment')),
        ];
    }
}
