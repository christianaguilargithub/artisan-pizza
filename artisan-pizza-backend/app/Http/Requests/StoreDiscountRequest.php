<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'promo_code'  => 'required|string|max:50|unique:discounts,promo_code',
            'type'        => 'required|in:fixed,percent',
            'value'       => 'required|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
            'expires_at'  => 'nullable|date',
        ];
    }
}
