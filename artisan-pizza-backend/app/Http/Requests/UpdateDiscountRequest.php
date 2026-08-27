<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $discountId = $this->route('discount')?->id;

        return [
            'name'        => 'sometimes|string|max:255',
            'promo_code'  => 'sometimes|string|max:50|unique:discounts,promo_code,' . $discountId,
            'type'        => 'sometimes|in:fixed,percent',
            'value'       => 'sometimes|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
            'expires_at'  => 'nullable|date',
        ];
    }
}
