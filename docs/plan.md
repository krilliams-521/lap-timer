# Lap Timer App Plan

---

## Features

- **Racers**
  - Each racer has:
    - ID
    - Name
    - Number
    - Laps completed
    - Lap times (array)
    - Position

  - Example interface:
    ```ts
    export interface Racer {
      id: string;
      name: string;
      number: string;
      lapTimes: number[];
      lapsCompleted: number;
    }
    ```

- **Race**
  - Each race has:
    - Racers (array of Racer)
    - Race start time
    - Race end time
    - Total laps
    - Leaderboard
  - Example interface:
    ```ts
    export interface Race {
      racers: Racer[];
      startTime: Date;
      endTime: Date | null;
      totalLaps: number;
      leaderboard: Racer[];
    }
    ```

- **Race Types**
  - Timed race (default): Log laps until admin clicks "End Race"
  - Timed team race: 2 racers per team

- **Race Flow**
  - Start race: Starts the clock
  - Log laps: By clicking racer name button or entering racer number manually
  - Logging a lap:
    - Saves lap time
    - Calculates race position
    - For team races, lap time is calculated based on teammates' last lap time
  - Leaderboard: Stores race positions
  - End race: Saves leaderboard

---

## Roadmap

- [ ] Add racer management
- [ ] Implement race start/stop logic
- [ ] Lap logging UI
- [ ] Leaderboard display
- [ ] Team race logic
- [ ] Data persistence

---

## Notes

- Use Expo for cross-platform support
- Prioritize simple, intuitive UI

---
