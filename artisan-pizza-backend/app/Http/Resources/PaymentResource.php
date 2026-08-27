<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'payment_method'  => $this->payment_method,
            'amount_tendered' => (float) $this->amount_tendered,
            'change_given'    => (float) $this->change_given,
            'qr_reference'    => $this->qr_reference,
            'status'          => $this->status,
            'voided_at'       => $this->voided_at,
            'voided_by'       => $this->voided_by,
            'order'           => new OrderResource($this->whenLoaded('order')),
            'created_at'      => $this->created_at,
        ];
    }
}
