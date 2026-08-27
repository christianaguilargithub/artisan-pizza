<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => 'sometimes|string|max:255',
            'unit'                => 'sometimes|string|max:50',
            'quantity'            => 'sometimes|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
        ];
    }
}
