import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate random date within last 30 days
function randomDate() {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return date
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@shoppulse.com' },
    update: {},
    create: {
      email: 'admin@shoppulse.com',
      name: 'Store Owner',
      passwordHash: adminPassword,
      role: 'admin',
    },
  })

  // Create sample customers (20-30 customers)
  const customerNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown',
    'Emily Davis', 'Chris Wilson', 'Jessica Martinez', 'Ryan Anderson', 'Amanda Taylor',
    'Kevin Thomas', 'Lisa Jackson', 'Brian White', 'Michelle Harris', 'Daniel Martin',
    'Nicole Thompson', 'Jason Garcia', 'Stephanie Martinez', 'Eric Robinson', 'Rachel Clark',
    'Mark Lewis', 'Lauren Walker', 'James Hall', 'Megan Allen', 'Andrew Young',
    'Olivia King', 'Brandon Wright', 'Samantha Lopez', 'Justin Hill', 'Brittany Green'
  ]

  const customers = []
  const customerPassword = await bcrypt.hash('customer123', 10)
  
  for (const name of customerNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`
    const customer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        passwordHash: customerPassword,
        role: 'customer',
        createdAt: randomDate(),
      },
    })
    customers.push(customer)
  }

  // Helper function to get category image path (Option 1: Category Images - 8 images total!)
  const getCategoryImagePath = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Produce': 'produce',
      'Dairy & Eggs': 'dairy-eggs',
      'Meat & Protein': 'meat-protein',
      'Bakery': 'bakery',
      'Pantry': 'pantry',
      'Snacks': 'snacks',
      'Beverages': 'beverages',
      'Frozen': 'frozen',
    }
    const folder = categoryMap[category] || 'default'
    return `/images/categories/${folder}.jpg`
  }

  // Grocery products organized by category
  const groceryProducts = [
    // 🥦 Produce (10 items)
    { name: 'Bananas', description: 'Fresh bananas, each', price: 0.79, category: 'Produce', stockQty: 150, lowStockThreshold: 10 },
    { name: 'Apples', description: 'Red delicious apples, bag', price: 4.99, category: 'Produce', stockQty: 80, lowStockThreshold: 10 },
    { name: 'Oranges', description: 'Navel oranges, bag', price: 5.99, category: 'Produce', stockQty: 70, lowStockThreshold: 10 },
    { name: 'Tomatoes', description: 'Roma tomatoes, 1 lb', price: 3.49, category: 'Produce', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Onions', description: 'Yellow onions, 3 lb bag', price: 2.99, category: 'Produce', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Potatoes', description: 'Russet potatoes, 5 lb bag', price: 4.99, category: 'Produce', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Bell Peppers', description: 'Mixed bell peppers, 3-pack', price: 4.49, category: 'Produce', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Spinach', description: 'Fresh baby spinach, box', price: 3.99, category: 'Produce', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Carrots', description: 'Baby carrots, bag', price: 2.49, category: 'Produce', stockQty: 55, lowStockThreshold: 10 },
    { name: 'Avocados', description: 'Hass avocados, 2-pack', price: 5.99, category: 'Produce', stockQty: 30, lowStockThreshold: 10 },

    // 🥛 Dairy & Eggs (10 items)
    { name: 'Whole Milk', description: '4L jug', price: 5.99, category: 'Dairy & Eggs', stockQty: 120, lowStockThreshold: 10 },
    { name: '2% Milk', description: '4L jug', price: 5.99, category: 'Dairy & Eggs', stockQty: 110, lowStockThreshold: 10 },
    { name: 'Almond Milk', description: 'Unsweetened, 1.89L', price: 4.99, category: 'Dairy & Eggs', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Greek Yogurt', description: 'Plain, 500g', price: 6.99, category: 'Dairy & Eggs', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Butter', description: 'Salted, 454g', price: 6.49, category: 'Dairy & Eggs', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Cheddar Cheese', description: 'Medium, 400g block', price: 7.99, category: 'Dairy & Eggs', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Mozzarella Cheese', description: 'Shredded, 340g', price: 6.99, category: 'Dairy & Eggs', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Cream Cheese', description: 'Philadelphia, 250g', price: 4.99, category: 'Dairy & Eggs', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Sour Cream', description: '500ml', price: 3.99, category: 'Dairy & Eggs', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Large Eggs', description: '12 count', price: 4.99, category: 'Dairy & Eggs', stockQty: 100, lowStockThreshold: 10 },

    // 🍗 Meat & Protein (10 items)
    { name: 'Chicken Breast', description: 'Boneless, skinless, 2-pack', price: 12.99, category: 'Meat & Protein', stockQty: 70, lowStockThreshold: 10 },
    { name: 'Chicken Thighs', description: 'Bone-in, family pack', price: 9.99, category: 'Meat & Protein', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Ground Beef', description: 'Lean, 500g', price: 8.99, category: 'Meat & Protein', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Beef Stew Cubes', description: '1 kg', price: 15.99, category: 'Meat & Protein', stockQty: 30, lowStockThreshold: 10 },
    { name: 'Salmon Fillet', description: 'Atlantic, 300g', price: 18.99, category: 'Meat & Protein', stockQty: 25, lowStockThreshold: 10 },
    { name: 'Frozen Shrimp', description: 'Medium, 400g', price: 12.99, category: 'Meat & Protein', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Turkey Slices', description: 'Deli style, 200g', price: 6.99, category: 'Meat & Protein', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Tofu', description: 'Firm, 350g', price: 3.99, category: 'Meat & Protein', stockQty: 30, lowStockThreshold: 10 },
    { name: 'Plant-Based Burgers', description: '4-pack', price: 9.99, category: 'Meat & Protein', stockQty: 20, lowStockThreshold: 10 },
    { name: 'Egg Whites', description: 'Carton, 500ml', price: 5.99, category: 'Meat & Protein', stockQty: 25, lowStockThreshold: 10 },

    // 🥖 Bakery (8 items)
    { name: 'White Bread Loaf', description: 'Fresh baked, 675g', price: 3.49, category: 'Bakery', stockQty: 90, lowStockThreshold: 10 },
    { name: 'Whole Wheat Bread', description: 'Fresh baked, 675g', price: 3.99, category: 'Bakery', stockQty: 70, lowStockThreshold: 10 },
    { name: 'Bagels', description: 'Plain, 6-pack', price: 4.99, category: 'Bakery', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Croissants', description: 'Butter, 4-pack', price: 5.99, category: 'Bakery', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Muffins', description: 'Assorted, 4-pack', price: 5.49, category: 'Bakery', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Burger Buns', description: 'Sesame seed, 8-pack', price: 3.99, category: 'Bakery', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Tortilla Wraps', description: 'Whole wheat, 10-pack', price: 4.49, category: 'Bakery', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Pita Bread', description: 'White, 6-pack', price: 3.99, category: 'Bakery', stockQty: 30, lowStockThreshold: 10 },

    // 🧂 Pantry (12 items)
    { name: 'White Rice', description: 'Long grain, 2 kg', price: 6.99, category: 'Pantry', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Basmati Rice', description: 'Premium, 2 kg', price: 8.99, category: 'Pantry', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Pasta Penne', description: '500g', price: 2.99, category: 'Pantry', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Pasta Spaghetti', description: '500g', price: 2.99, category: 'Pantry', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Olive Oil', description: 'Extra virgin, 500ml', price: 9.99, category: 'Pantry', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Vegetable Oil', description: '1L', price: 4.99, category: 'Pantry', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Flour', description: 'All-purpose, 2.5 kg', price: 5.99, category: 'Pantry', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Sugar', description: 'White, 2 kg', price: 4.99, category: 'Pantry', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Salt', description: 'Table salt, 1 kg', price: 2.49, category: 'Pantry', stockQty: 55, lowStockThreshold: 10 },
    { name: 'Black Pepper', description: 'Ground, 100g', price: 3.99, category: 'Pantry', stockQty: 30, lowStockThreshold: 10 },
    { name: 'Canned Chickpeas', description: '540ml', price: 2.99, category: 'Pantry', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Canned Tomatoes', description: 'Diced, 796ml', price: 2.49, category: 'Pantry', stockQty: 50, lowStockThreshold: 10 },

    // 🍿 Snacks (10 items)
    { name: 'Potato Chips', description: 'Classic, 200g', price: 4.99, category: 'Snacks', stockQty: 80, lowStockThreshold: 10 },
    { name: 'Tortilla Chips', description: 'Restaurant style, 300g', price: 5.49, category: 'Snacks', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Granola Bars', description: 'Mixed variety, 6-pack', price: 5.99, category: 'Snacks', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Chocolate Bar', description: 'Milk chocolate, 100g', price: 2.99, category: 'Snacks', stockQty: 70, lowStockThreshold: 10 },
    { name: 'Cookies', description: 'Chocolate chip, 300g', price: 4.49, category: 'Snacks', stockQty: 55, lowStockThreshold: 10 },
    { name: 'Crackers', description: 'Saltines, 400g', price: 3.99, category: 'Snacks', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Trail Mix', description: 'Nuts and dried fruit, 300g', price: 6.99, category: 'Snacks', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Popcorn', description: 'Microwave, 3-pack', price: 4.99, category: 'Snacks', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Almonds', description: 'Raw, 200g', price: 8.99, category: 'Snacks', stockQty: 30, lowStockThreshold: 10 },
    { name: 'Candy Pack', description: 'Assorted, 200g', price: 3.49, category: 'Snacks', stockQty: 50, lowStockThreshold: 10 },

    // 🥤 Beverages (10 items)
    { name: 'Bottled Water', description: '24-pack, 500ml', price: 6.99, category: 'Beverages', stockQty: 100, lowStockThreshold: 10 },
    { name: 'Sparkling Water', description: '12-pack, 355ml', price: 5.99, category: 'Beverages', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Orange Juice', description: 'Fresh squeezed, 1.75L', price: 5.99, category: 'Beverages', stockQty: 70, lowStockThreshold: 10 },
    { name: 'Apple Juice', description: '100% juice, 1.75L', price: 4.99, category: 'Beverages', stockQty: 55, lowStockThreshold: 10 },
    { name: 'Cola', description: '2L bottle', price: 2.99, category: 'Beverages', stockQty: 80, lowStockThreshold: 10 },
    { name: 'Diet Cola', description: '2L bottle', price: 2.99, category: 'Beverages', stockQty: 75, lowStockThreshold: 10 },
    { name: 'Energy Drink', description: '4-pack, 473ml', price: 7.99, category: 'Beverages', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Sports Drink', description: '6-pack, 591ml', price: 8.99, category: 'Beverages', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Iced Tea', description: 'Lemon, 1.89L', price: 3.99, category: 'Beverages', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Coffee Beans', description: 'Medium roast, 340g', price: 12.99, category: 'Beverages', stockQty: 35, lowStockThreshold: 10 },

    // ❄️ Frozen (10 items)
    { name: 'Frozen Pizza', description: 'Pepperoni, 12 inch', price: 7.99, category: 'Frozen', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Frozen Fries', description: 'Straight cut, 750g', price: 4.99, category: 'Frozen', stockQty: 60, lowStockThreshold: 10 },
    { name: 'Frozen Vegetables', description: 'Mixed, 750g', price: 3.99, category: 'Frozen', stockQty: 55, lowStockThreshold: 10 },
    { name: 'Frozen Fruit', description: 'Mixed berries, 600g', price: 6.99, category: 'Frozen', stockQty: 40, lowStockThreshold: 10 },
    { name: 'Ice Cream', description: 'Vanilla, 1.5L', price: 5.99, category: 'Frozen', stockQty: 45, lowStockThreshold: 10 },
    { name: 'Frozen Chicken Nuggets', description: '1 kg', price: 9.99, category: 'Frozen', stockQty: 50, lowStockThreshold: 10 },
    { name: 'Frozen Fish Sticks', description: '12 count', price: 6.99, category: 'Frozen', stockQty: 35, lowStockThreshold: 10 },
    { name: 'Frozen Dumplings', description: 'Pork, 500g', price: 8.99, category: 'Frozen', stockQty: 30, lowStockThreshold: 10 },
    { name: 'Frozen Lasagna', description: 'Family size, 1.5 kg', price: 12.99, category: 'Frozen', stockQty: 25, lowStockThreshold: 10 },
    { name: 'Frozen Waffles', description: '8-pack', price: 4.99, category: 'Frozen', stockQty: 40, lowStockThreshold: 10 },
  ]

  // Create products with category images
  const createdProducts = []
  for (const product of groceryProducts) {
    try {
      // Use category images - only 8 images needed instead of 80!
      const imageUrl = getCategoryImagePath(product.category)
      
      const created = await prisma.product.create({
        data: {
          ...product,
          imageUrl,
        },
      })
      createdProducts.push(created)
    } catch (error) {
      // Product might already exist, skip
    }
  }

  console.log(`✅ Created ${createdProducts.length} products`)

  // Create fake orders (60-100 orders) with realistic patterns
  const fastMovers = createdProducts.filter(p => 
    ['Bananas', 'Whole Milk', '2% Milk', 'White Bread Loaf', 'Large Eggs', 
     'Chicken Breast', 'Potato Chips', 'Bottled Water', 'Cola'].includes(p.name)
  )

  const orderCount = 80
  const orders = []

  for (let i = 0; i < orderCount; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const orderDate = randomDate()
    
    const itemCount = Math.floor(Math.random() * 5) + 2
    const orderItems = []
    let total = 0

    const useFastMovers = Math.random() < 0.6
    const productPool = useFastMovers ? fastMovers : createdProducts

    const selectedProducts = new Set()
    for (let j = 0; j < itemCount; j++) {
      const product = productPool[Math.floor(Math.random() * productPool.length)]
      if (selectedProducts.has(product.id)) continue
      selectedProducts.add(product.id)

      const qty = Math.floor(Math.random() * 3) + 1
      const itemTotal = product.price * qty
      total += itemTotal

      orderItems.push({
        productId: product.id,
        qty,
        priceAtPurchase: product.price,
      })
    }

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        total: Math.round(total * 100) / 100,
        status: Math.random() > 0.1 ? (Math.random() > 0.3 ? 'delivered' : 'shipped') : 'processing',
        shippingInfo: JSON.stringify({
          name: customer.name,
          email: customer.email,
          phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
          address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: 'City',
          state: 'State',
          zip: `${Math.floor(Math.random() * 90000) + 10000}`,
        }),
        createdAt: orderDate,
        items: {
          create: orderItems,
        },
      },
    })

    orders.push(order)

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQty: {
            decrement: item.qty,
          },
        },
      })
    }
  }

  console.log(`✅ Created ${orders.length} orders`)

  // Create analytics events
  for (let i = 0; i < 200; i++) {
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
    const customer = Math.random() > 0.3 ? customers[Math.floor(Math.random() * customers.length)] : null
    
    await prisma.event.create({
      data: {
        type: 'product_view',
        userId: customer?.id,
        productId: product.id,
        createdAt: randomDate(),
      },
    })
  }

  for (let i = 0; i < 150; i++) {
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
    const customer = customers[Math.floor(Math.random() * customers.length)]
    
    await prisma.event.create({
      data: {
        type: 'add_to_cart',
        userId: customer.id,
        productId: product.id,
        createdAt: randomDate(),
      },
    })
  }

  console.log('✅ Created analytics events')

  console.log('\n🎉 Seed data created successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${customers.length} customers`)
  console.log(`   - ${createdProducts.length} products`)
  console.log(`   - ${orders.length} orders`)
  console.log('\n🖼️  Category Images Setup:')
  console.log('   Using category-based images (8 images total instead of 80!)')
  console.log('   Place images in: public/images/categories/')
  console.log('   Required files:')
  console.log('     - produce.jpg')
  console.log('     - dairy-eggs.jpg')
  console.log('     - meat-protein.jpg')
  console.log('     - bakery.jpg')
  console.log('     - pantry.jpg')
  console.log('     - snacks.jpg')
  console.log('     - beverages.jpg')
  console.log('     - frozen.jpg')
  console.log('\n   Until you add these images, products will show a "No Image" placeholder.')
  console.log('   Download free images from Unsplash or Pexels!')
  console.log('\n🔑 Login Credentials:')
  console.log('   Admin:')
  console.log('     Email: admin@shoppulse.com')
  console.log('     Password: admin123')
  console.log('   Customer (any of 30):')
  console.log('     Email: [name]@example.com (e.g., john.doe@example.com)')
  console.log('     Password: customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

