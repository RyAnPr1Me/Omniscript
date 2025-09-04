import { DateTime, DateTimeUtils } from "../../src/stdlib/datetime";

describe("DateTime Library", () => {
  describe("Construction and Factory Methods", () => {
    it("should create DateTime from various inputs", () => {
      const now = DateTime.now();
      const fromString = new DateTime("2023-12-25");
      const fromTimestamp = DateTime.fromTimestamp(1703462400000);

      expect(now.isValid()).toBe(true);
      expect(fromString.isValid()).toBe(true);
      expect(fromTimestamp.isValid()).toBe(true);
    });

    it("should create today, tomorrow, yesterday", () => {
      const today = DateTime.today();
      const tomorrow = DateTime.tomorrow();
      const yesterday = DateTime.yesterday();

      expect(tomorrow.diff(today, "days")).toBe(1);
      expect(today.diff(yesterday, "days")).toBe(1);
    });

    it("should throw error for invalid dates", () => {
      expect(() => new DateTime("invalid-date")).toThrow("Invalid date input");
    });
  });

  describe("Arithmetic Operations", () => {
    it("should add time units correctly", () => {
      const date = new DateTime("2023-01-01T12:00:00Z");

      expect(date.add(1, "years").year).toBe(2024);
      expect(date.add(1, "months").month).toBe(1); // February (0-indexed)
      expect(date.add(1, "days").day).toBe(2);
      expect(date.add(1, "hours").hour).toBe(13);
      expect(date.add(1, "minutes").minute).toBe(1);
      expect(date.add(1000, "milliseconds").second).toBe(1);
    });

    it("should subtract time units correctly", () => {
      const date = new DateTime("2023-02-15T12:30:30Z");

      expect(date.subtract(1, "years").year).toBe(2022);
      expect(date.subtract(1, "months").month).toBe(0); // January
      expect(date.subtract(1, "days").day).toBe(14);
      expect(date.subtract(1, "hours").hour).toBe(11);
    });
  });

  describe("Comparison Methods", () => {
    it("should compare dates correctly", () => {
      const date1 = new DateTime("2023-01-01");
      const date2 = new DateTime("2023-01-02");
      const date3 = new DateTime("2023-01-01");

      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isAfter(date1)).toBe(true);
      expect(date1.isSame(date3)).toBe(true);
      expect(date1.isSame(date3, "days")).toBe(true);
    });

    it("should check if date is between range", () => {
      const start = new DateTime("2023-01-01");
      const middle = new DateTime("2023-01-15");
      const end = new DateTime("2023-01-31");

      expect(middle.isBetween(start, end)).toBe(true);
      expect(middle.isBetween(start, end, true)).toBe(true);
      expect(start.isBetween(start, end, true)).toBe(true);
      expect(start.isBetween(start, end, false)).toBe(false);
    });
  });

  describe("Duration and Differences", () => {
    it("should calculate differences in various units", () => {
      const date1 = new DateTime("2023-01-01T00:00:00Z");
      const date2 = new DateTime("2023-01-02T12:30:00Z");

      expect(date2.diff(date1, "days")).toBe(1);
      expect(date2.diff(date1, "hours")).toBe(36);
      expect(date2.diff(date1, "minutes")).toBe(2190);
    });

    it("should calculate duration objects", () => {
      const date1 = new DateTime("2023-01-01T00:00:00Z");
      const date2 = new DateTime("2023-01-02T01:30:30Z");

      const duration = date2.duration(date1);
      expect(duration.days).toBe(1);
      expect(duration.hours).toBe(1);
      expect(duration.minutes).toBe(30);
      expect(duration.seconds).toBe(30);
    });
  });

  describe("Formatting", () => {
    it("should format dates with patterns", () => {
      const date = new DateTime("2023-12-25T15:30:45.123Z");

      expect(date.format("YYYY-MM-DD")).toBe("2023-12-25");
      expect(date.format("DD/MM/YY")).toBe("25/12/23");
      expect(date.format("HH:mm:ss")).toBe("15:30:45");
    });

    it("should convert to various string formats", () => {
      const date = new DateTime("2023-12-25T15:30:45.123Z");

      expect(date.toISO()).toContain("2023-12-25");
      expect(date.toDateString()).toContain("Dec");
      expect(date.toTimeString()).toContain("15:30:45");
    });
  });

  describe("Date Component Getters", () => {
    it("should get date components correctly", () => {
      const date = new DateTime("2023-12-25T15:30:45.123Z");

      expect(date.year).toBe(2023);
      expect(date.month).toBe(11); // December (0-indexed)
      expect(date.day).toBe(25);
      expect(date.hour).toBe(15);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
      expect(date.millisecond).toBe(123);
    });

    it("should calculate derived properties", () => {
      const date = new DateTime("2023-12-25"); // Monday

      expect(date.dayOfWeek).toBe(1); // Monday = 1
      expect(date.dayOfYear).toBeGreaterThan(350);
      expect(date.weekOfYear).toBeGreaterThan(50);
      expect(typeof date.timestamp).toBe("number");
      expect(typeof date.unix).toBe("number");
    });
  });

  describe("Date Component Setters", () => {
    it("should set date components correctly", () => {
      const date = new DateTime("2023-01-01T12:00:00Z");

      const newYear = date.setYear(2024);
      const newMonth = date.setMonth(5); // June
      const newDay = date.setDay(15);
      const newHour = date.setHour(18);

      expect(newYear.year).toBe(2024);
      expect(newMonth.month).toBe(5);
      expect(newDay.day).toBe(15);
      expect(newHour.hour).toBe(18);

      // Original should be unchanged
      expect(date.year).toBe(2023);
    });
  });

  describe("Start/End of Period", () => {
    it("should get start and end of periods", () => {
      const date = new DateTime("2023-06-15T15:30:45Z");

      const startOfYear = date.startOf("years");
      const endOfYear = date.endOf("years");
      const startOfMonth = date.startOf("months");
      const startOfDay = date.startOf("days");

      expect(startOfYear.month).toBe(0); // January
      expect(startOfYear.day).toBe(1);
      expect(endOfYear.month).toBe(11); // December
      expect(startOfMonth.day).toBe(1);
      expect(startOfDay.hour).toBe(0);
      expect(startOfDay.minute).toBe(0);
    });
  });

  describe("Utility Methods", () => {
    it("should check leap years", () => {
      const leap2024 = new DateTime("2024-01-01");
      const notLeap2023 = new DateTime("2023-01-01");

      expect(leap2024.isLeapYear()).toBe(true);
      expect(notLeap2023.isLeapYear()).toBe(false);
      expect(DateTime.isLeapYear(2024)).toBe(true);
      expect(DateTime.isLeapYear(2023)).toBe(false);
    });

    it("should calculate days in month", () => {
      const jan = new DateTime("2023-01-15");
      const feb = new DateTime("2023-02-15");
      const febLeap = new DateTime("2024-02-15");

      expect(jan.daysInMonth()).toBe(31);
      expect(feb.daysInMonth()).toBe(28);
      expect(febLeap.daysInMonth()).toBe(29);

      expect(DateTime.daysInMonth(2023, 1)).toBe(28);
      expect(DateTime.daysInMonth(2024, 1)).toBe(29);
    });

    it("should check day types", () => {
      const monday = new DateTime("2023-12-25"); // Monday
      const saturday = new DateTime("2023-12-23"); // Saturday
      const sunday = new DateTime("2023-12-24"); // Sunday

      expect(monday.isWeekday()).toBe(true);
      expect(monday.isWeekend()).toBe(false);
      expect(saturday.isWeekend()).toBe(true);
      expect(sunday.isWeekend()).toBe(true);
    });

    it("should clone dates", () => {
      const original = new DateTime("2023-01-01");
      const cloned = original.clone();

      expect(cloned.isSame(original)).toBe(true);
      expect(cloned).not.toBe(original); // Different objects
    });
  });

  describe("Static Utility Methods", () => {
    it("should find min and max dates", () => {
      const dates = [
        new DateTime("2023-01-01"),
        new DateTime("2023-12-31"),
        new DateTime("2023-06-15"),
      ];

      const min = DateTime.min(...dates);
      const max = DateTime.max(...dates);

      expect(min.month).toBe(0); // January
      expect(max.month).toBe(11); // December
    });
  });

  describe("DateTimeUtils", () => {
    it("should format durations", () => {
      const duration = {
        years: 1,
        months: 2,
        weeks: 0,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 123,
      };

      const formatted = DateTimeUtils.formatDuration(duration);
      expect(formatted).toBe("1y 2mo 3d 4h 5m 6s 123ms");
    });

    it("should humanize milliseconds", () => {
      const ms = 1000 * 60 * 60 * 25 + 1000 * 30; // 25 hours 30 seconds
      const humanized = DateTimeUtils.humanizeDuration(ms);

      expect(humanized).toContain("1d");
      expect(humanized).toContain("1h");
      expect(humanized).toContain("30s");
    });

    it("should handle sleep function", async () => {
      const start = Date.now();
      await DateTimeUtils.sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
    });

    it("should handle timeout function", async () => {
      const fastPromise = Promise.resolve("success");
      const slowPromise = new Promise((resolve) =>
        setTimeout(() => resolve("too slow"), 200),
      );

      await expect(DateTimeUtils.timeout(fastPromise, 100)).resolves.toBe(
        "success",
      );
      await expect(DateTimeUtils.timeout(slowPromise, 100)).rejects.toThrow(
        "Operation timed out",
      );
    });
  });
});
