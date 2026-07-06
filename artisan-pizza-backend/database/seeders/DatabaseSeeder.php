<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed roles
        $adminRole  = Role::firstOrCreate(['name' => 'admin']);
        $cashier    = Role::firstOrCreate(['name' => 'cashier']);
        $kitchen    = Role::firstOrCreate(['name' => 'kitchen']);
        $customer   = Role::firstOrCreate(['name' => 'customer']);

        // Seed default admin user
        User::firstOrCreate(
            ['email' => 'admin@artisanpizza.com'],
            [
                'role_id'  => $adminRole->id,
                'name'     => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );

        // Seed default cashier
        User::firstOrCreate(
            ['email' => 'cashier@artisanpizza.com'],
            [
                'role_id'  => $cashier->id,
                'name'     => 'Cashier User',
                'password' => Hash::make('password'),
            ]
        );
    }
}
