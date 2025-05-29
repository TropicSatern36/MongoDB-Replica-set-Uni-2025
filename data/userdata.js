module.exports = [
  {
    username: "johnDoe123",
    email: "john.doe@example.com",
    password: "hashedPassword1",
    role: "customer",
    address: {
      street: "123 Maple Street",
      city: "New York",
      postalCode: "10001",
      country: "USA"
    },
    createdAt: new Date("2024-12-01T10:30:00Z")
  },
  {
    username: "adminUser",
    email: "admin@example.com",
    password: "hashedAdminPassword",
    role: "admin",
    address: {
      street: "1 Infinite Loop",
      city: "Cupertino",
      postalCode: "95014",
      country: "USA"
    },
    createdAt: new Date("2024-12-05T08:00:00Z")
  },
  {
    username: "aliceWonder",
    email: "alice@example.com",
    password: "hashedPassword2",
    role: "customer",
    address: {
      street: "456 Wonderland Ave",
      city: "London",
      postalCode: "SW1A 1AA",
      country: "UK"
    },
    createdAt: new Date("2025-01-10T14:15:00Z")
  },
  {
    username: "brian.tech",
    email: "brian.tech@example.net",
    password: "hashedPassword3",
    role: "customer",
    address: {
      street: "789 Silicon Blvd",
      city: "San Francisco",
      postalCode: "94103",
      country: "USA"
    },
    createdAt: new Date("2025-03-03T12:45:00Z")
  },
  {
    username: "maria_g",
    email: "maria.garcia@example.es",
    password: "hashedPassword4",
    role: "customer",
    address: {
      street: "12 Calle Mayor",
      city: "Madrid",
      postalCode: "28013",
      country: "Spain"
    },
    createdAt: new Date("2025-04-18T09:30:00Z")
  }
];
