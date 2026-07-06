<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::with('role')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role_id'  => 'required|exists:roles,id',
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json($user->load('role'), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('role', 'orders'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role_id'  => 'sometimes|exists:roles,id',
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user->load('role'));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
