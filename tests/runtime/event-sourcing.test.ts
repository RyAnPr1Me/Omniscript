import {
  eventSourcingSystem,
  UserAggregate,
  DomainEvent,
  EventHandler,
} from "../../src/runtime/event-sourcing";

describe("Event Sourcing System", () => {
  let eventStore: any;
  let eventBus: any;
  let repository: any;

  beforeEach(() => {
    eventStore = eventSourcingSystem.getEventStore();
    eventBus = eventSourcingSystem.getEventBus();
    repository = eventSourcingSystem.createRepository<UserAggregate>();
  });

  test("user aggregate lifecycle", async () => {
    const user = new UserAggregate("user-123");

    // Register user
    user.register("John Doe", "john@example.com");
    expect(user.getName()).toBe("John Doe");
    expect(user.getEmail()).toBe("john@example.com");
    expect(user.getIsActive()).toBe(true);

    // Change email
    user.changeEmail("john.doe@example.com");
    expect(user.getEmail()).toBe("john.doe@example.com");

    // Deactivate user
    user.deactivate();
    expect(user.getIsActive()).toBe(false);

    // Check uncommitted events
    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe("UserRegistered");
    expect(events[1].type).toBe("EmailChanged");
    expect(events[2].type).toBe("UserDeactivated");
  });

  test("save and load aggregate from repository", async () => {
    const user = new UserAggregate("user-456");
    user.register("Jane Smith", "jane@example.com");
    user.changeEmail("jane.smith@example.com");

    // Save aggregate
    await repository.save(user);

    // Load aggregate
    const loadedUser = await repository.getById(
      "user-456",
      (id: string) => new UserAggregate(id),
    );

    expect(loadedUser).not.toBeNull();
    expect(loadedUser!.getName()).toBe("Jane Smith");
    expect(loadedUser!.getEmail()).toBe("jane.smith@example.com");
    expect(loadedUser!.getVersion()).toBe(2);
  });

  test("event store operations", async () => {
    const events: DomainEvent[] = [
      {
        id: "event-1",
        type: "UserRegistered",
        aggregateId: "user-789",
        aggregateType: "User",
        payload: { name: "Bob Wilson", email: "bob@example.com" },
        metadata: {},
        timestamp: Date.now(),
        version: 1,
      },
      {
        id: "event-2",
        type: "EmailChanged",
        aggregateId: "user-789",
        aggregateType: "User",
        payload: {
          oldEmail: "bob@example.com",
          newEmail: "bob.wilson@example.com",
        },
        metadata: {},
        timestamp: Date.now(),
        version: 2,
      },
    ];

    await eventStore.append(events);

    // Get events for aggregate
    const aggregateEvents = await eventStore.getEvents("user-789");
    expect(aggregateEvents).toHaveLength(2);

    // Get events by type
    const registrationEvents =
      await eventStore.getEventsByType("UserRegistered");
    expect(registrationEvents.length).toBeGreaterThanOrEqual(1);

    // Get all events
    const allEvents = await eventStore.getAllEvents();
    expect(allEvents.length).toBeGreaterThanOrEqual(2);
  });

  test("event bus and handlers", async () => {
    let handledEvent: DomainEvent | null = null;

    const handler: EventHandler = {
      eventType: "UserRegistered",
      handle: async (event: DomainEvent) => {
        handledEvent = event;
        return "handled";
      },
    };

    eventBus.subscribe("UserRegistered", handler);

    const event: DomainEvent = {
      id: "event-test",
      type: "UserRegistered",
      aggregateId: "user-test",
      aggregateType: "User",
      payload: { name: "Test User", email: "test@example.com" },
      metadata: {},
      timestamp: Date.now(),
      version: 1,
    };

    await eventBus.publish(event);

    expect(handledEvent).not.toBeNull();
    expect(handledEvent!.type).toBe("UserRegistered");
    expect(handledEvent!.payload.name).toBe("Test User");
  });

  test("projections", async () => {
    const projectionData: any = {};

    eventBus.addProjection("userView", async (event: DomainEvent) => {
      if (event.type === "UserRegistered") {
        projectionData[event.aggregateId] = {
          name: event.payload.name,
          email: event.payload.email,
          active: true,
        };
      } else if (event.type === "EmailChanged") {
        if (projectionData[event.aggregateId]) {
          projectionData[event.aggregateId].email = event.payload.newEmail;
        }
      } else if (event.type === "UserDeactivated") {
        if (projectionData[event.aggregateId]) {
          projectionData[event.aggregateId].active = false;
        }
      }
    });

    const user = new UserAggregate("user-projection");
    user.register("Projection User", "projection@example.com");
    user.changeEmail("new-projection@example.com");
    user.deactivate();

    await repository.save(user);

    expect(projectionData["user-projection"]).toEqual({
      name: "Projection User",
      email: "new-projection@example.com",
      active: false,
    });
  });

  test("snapshots", async () => {
    const snapshotStore = eventSourcingSystem.getSnapshotStore();

    const user = new UserAggregate("user-snapshot");
    user.register("Snapshot User", "snapshot@example.com");

    const snapshot = user.createSnapshot();
    await snapshotStore.save(snapshot);

    const loadedSnapshot = await snapshotStore.get<{
      name: string;
      email: string;
      isActive: boolean;
    }>("user-snapshot");
    expect(loadedSnapshot).not.toBeNull();
    expect(loadedSnapshot!.data.name).toBe("Snapshot User");
    expect(loadedSnapshot!.data.email).toBe("snapshot@example.com");
    expect(loadedSnapshot!.version).toBe(1);

    // Load user from snapshot
    const newUser = new UserAggregate("user-snapshot");
    newUser.loadFromSnapshot(loadedSnapshot!);

    expect(newUser.getName()).toBe("Snapshot User");
    expect(newUser.getEmail()).toBe("snapshot@example.com");
    expect(newUser.getVersion()).toBe(1);
  });

  test("aggregate validation and business rules", () => {
    const user = new UserAggregate("user-validation");

    // Cannot change email before registration
    expect(() => {
      user.changeEmail("test@example.com");
    }).toThrow("Cannot change email for inactive user");

    // Register user first
    user.register("Valid User", "valid@example.com");

    // Cannot register again
    expect(() => {
      user.register("Another Name", "another@example.com");
    }).toThrow("User is already registered");

    // Can change email after registration
    expect(() => {
      user.changeEmail("updated@example.com");
    }).not.toThrow();

    // Deactivate user
    user.deactivate();

    // Cannot deactivate again
    expect(() => {
      user.deactivate();
    }).toThrow("User is already deactivated");
  });
});
