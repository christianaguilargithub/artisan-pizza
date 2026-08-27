<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessPaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id'        => 'required|exists:orders,id|unique:payments,order_id',
            'payment_method'  => 'required|in:cash,qr,card',
            'amount_tendered' => 'required|numeric|min:0',
            'qr_reference'    => 'nullable|string|max:255',
        ];
    }
}
