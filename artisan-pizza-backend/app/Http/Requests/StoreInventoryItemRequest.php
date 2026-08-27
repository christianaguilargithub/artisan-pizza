<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => 'required|string|max:255',
            'unit'                => 'required|string|max:50',
            'quantity'            => 'required|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
        ];
    }
}
