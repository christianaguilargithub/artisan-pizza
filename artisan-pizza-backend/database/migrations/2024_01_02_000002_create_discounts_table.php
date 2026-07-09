<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists in DB with compatible schema — rename columns to match
        Schema::table('discounts', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('discounts', 'code')) {
                $table->string('code')->unique()->nullable();
            }
            if (!Schema::hasColumn('discounts', 'description')) {
                $table->string('description')->nullable();
            }
            if (!Schema::hasColumn('discounts', 'max_uses')) {
                $table->integer('max_uses')->nullable();
            }
            if (!Schema::hasColumn('discounts', 'used_count')) {
                $table->integer('used_count')->default(0);
            }
        });
    }

    public function down(): void
    {
        // intentionally left blank
    }
};
