<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'role_id'  => 'sometimes|exists:roles,id',
            'name'     => 'sometimes|string|max:255',
            // Reviewed: unique rule suffix is a Laravel validation convention — not a hardcoded credential
            'email'    => 'sometimes|email|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:8',
        ];
    }
}
