<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Actions\Billing\AssignSequenceBlockAction;
use App\Models\Establishment;
use App\Models\EmissionPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AssignSequenceBlockActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigns_consecutive_blocks()
    {
        $establishment = Establishment::factory()->create();
        $emissionPoint = EmissionPoint::factory()->create(['establishment_id' => $establishment->id]);
        
        $action = new AssignSequenceBlockAction();
        
        $block1 = $action->execute($establishment, $emissionPoint, 'device1', 100);
        $block2 = $action->execute($establishment, $emissionPoint, 'device2', 100);
        
        $this->assertEquals(1, $block1->from_number);
        $this->assertEquals(100, $block1->to_number);
        $this->assertEquals(101, $block2->from_number);
        $this->assertEquals(200, $block2->to_number);
    }
    
    public function test_prevents_collision()
    {
        $establishment = Establishment::factory()->create();
        $emissionPoint = EmissionPoint::factory()->create(['establishment_id' => $establishment->id]);
        
        $action = new AssignSequenceBlockAction();
        
        $block1 = $action->execute($establishment, $emissionPoint, 'device1', 100);
        $block2 = $action->execute($establishment, $emissionPoint, 'device2', 100);
        
        $this->assertNotEquals($block1->from_number, $block2->from_number);
        $this->assertNotEquals($block1->to_number, $block2->to_number);
    }
}
