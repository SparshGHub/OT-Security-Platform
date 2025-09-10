import SimulationCard from '@/components/simulation/simulation-card';

export default function SimulatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Simulation Environment</h1>
        <p className="text-muted-foreground mt-2">
          Trigger example setpoint writes to test the security monitoring system.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SimulationCard
          title="Drum Level Setpoint"
          description="Write Drum SP (reg:41010)"
          defaultValue={56.0}
          roles={['BOILER-HMI', 'EWS']}
          simulationType="drum"
        />
        <SimulationCard
          title="Turbine Load Setpoint"
          description="Write Load SP (reg:42001)"
          defaultValue={215.0}
          roles={['TCS-HMI', 'EWS']}
          simulationType="load"
        />
      </div>
    </div>
  );
}
