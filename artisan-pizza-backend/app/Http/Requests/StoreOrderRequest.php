<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_source'       => 'required|in:dine-in,online,walk-in',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'discount_code'      => 'nullable|string',
            'notes'              => 'nullable|string',
            // tax_rate intentionally excluded — enforced server-side via config('pos.tax_rate')
        ];
    }
}
