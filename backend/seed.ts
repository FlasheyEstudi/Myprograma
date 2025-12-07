import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create sample users
    const adminPassword = await hashPassword('Admin123!');
    const userPassword = await hashPassword('User123!');

    const admin = await db.user.upsert({
      where: { email: 'admin@reservenow.com' },
      update: {},
      create: {
        email: 'admin@reservenow.com',
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    const user = await db.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        passwordHash: userPassword,
        name: 'John Doe',
        phone: '+1234567890',
        role: 'USER',
      },
    });

    console.log('Users created:', { admin: admin.email, user: user.email });

    // Create sample restaurants
    const restaurants = [
      {
        name: 'The Italian Place',
        description: 'Authentic Italian cuisine with a modern twist',
        cuisine: 'Italian',
        address: '123 Main St, New York, NY 10001',
        phone: '+1-212-555-0101',
        email: 'info@italianplace.com',
        openingTime: '11:00',
        closingTime: '23:00',
        maxCapacity: 100,
        priceRange: 'HIGH' as const,
      },
      {
        name: 'Sushi Master',
        description: 'Traditional Japanese sushi and sashimi',
        cuisine: 'Japanese',
        address: '456 Oak Ave, New York, NY 10002',
        phone: '+1-212-555-0102',
        email: 'hello@sushimaster.com',
        openingTime: '12:00',
        closingTime: '22:00',
        maxCapacity: 60,
        priceRange: 'PREMIUM' as const,
      },
      {
        name: 'Burger Joint',
        description: 'Gourmet burgers and craft beers',
        cuisine: 'American',
        address: '789 Pine St, New York, NY 10003',
        phone: '+1-212-555-0103',
        openingTime: '10:00',
        closingTime: '00:00',
        maxCapacity: 80,
        priceRange: 'MEDIUM' as const,
      },
      {
        name: 'Spice Garden',
        description: 'Authentic Indian flavors and vegetarian options',
        cuisine: 'Indian',
        address: '321 Elm St, New York, NY 10004',
        phone: '+1-212-555-0104',
        openingTime: '11:30',
        closingTime: '22:30',
        maxCapacity: 70,
        priceRange: 'LOW' as const,
      },
    ];

    const createdRestaurants = [];
    for (const restaurantData of restaurants) {
      // Check if restaurant already exists
      const existingRestaurant = await db.restaurant.findFirst({
        where: { name: restaurantData.name }
      });
      
      if (!existingRestaurant) {
        const restaurant = await db.restaurant.create({
          data: restaurantData,
        });
        createdRestaurants.push(restaurant);
      } else {
        createdRestaurants.push(existingRestaurant);
      }
    }

    console.log('Restaurants created:', createdRestaurants.map(r => r.name));

    // Create tables for each restaurant
    for (const restaurant of createdRestaurants) {
      const tables = [];
      const tableCount = restaurant.name === 'Sushi Master' ? 8 : 10;
      
      for (let i = 1; i <= tableCount; i++) {
        const capacity = i <= 2 ? 2 : i <= 6 ? 4 : i <= 8 ? 6 : 8;
        const table = await db.table.create({
          data: {
            restaurantId: restaurant.id,
            tableNumber: `T${i.toString().padStart(2, '0')}`,
            capacity,
            hasWindow: i % 3 === 0,
            hasOutdoor: i % 4 === 0,
            isPrivate: i === tableCount,
          },
        });
        tables.push(table);
      }
      console.log(`Created ${tables.length} tables for ${restaurant.name}`);
    }

    // Create sample reviews
    const reviews = [
      {
        restaurantId: createdRestaurants[0].id, // The Italian Place
        userId: user.id,
        rating: 5,
        title: 'Amazing Italian Experience',
        content: 'The pasta was perfectly cooked and the service was exceptional. Will definitely come back!',
      },
      {
        restaurantId: createdRestaurants[1].id, // Sushi Master
        userId: user.id,
        rating: 4,
        title: 'Fresh and Delicious',
        content: 'Great sushi selection, very fresh. A bit pricey but worth it for special occasions.',
      },
      {
        restaurantId: createdRestaurants[2].id, // Burger Joint
        userId: user.id,
        rating: 4,
        title: 'Best Burger in Town',
        content: 'Juicy, flavorful burgers with great toppings. The craft beer selection is impressive.',
      },
    ];

    for (const reviewData of reviews) {
      const review = await db.review.create({
        data: {
          ...reviewData,
          isVerified: true,
          isApproved: true,
        },
      });
      console.log(`Created review for ${reviewData.restaurantId}`);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@reservenow.com / Admin123!');
    console.log('User: user@example.com / User123!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });