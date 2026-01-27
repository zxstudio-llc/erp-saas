<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoice_sequence_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('emission_point_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('from_number');
            $table->unsignedBigInteger('to_number');
            $table->unsignedBigInteger('current_number');
            $table->enum('status', ['available', 'exhausted'])->default('available');
            $table->string('device_id')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['establishment_id', 'emission_point_id', 'status']);
            $table->unique(['establishment_id', 'emission_point_id', 'from_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_sequence_blocks');
    }
};
