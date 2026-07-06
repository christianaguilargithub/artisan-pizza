<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Role::all());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name|max:100',
        ]);

        $role = Role::create($data);

        return response()->json($role, 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('users'));
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id . '|max:100',
        ]);

        $role->update($data);

        return response()->json($role);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
