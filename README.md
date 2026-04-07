This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (recommended package manager)
- **PostgreSQL** (v12 or higher)

### Initial Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   
   Create a `.env.local` file in the root directory with the following content:
   
   ```bash
   # Database Configuration
   DATABASE_URL="postgresql://localhost:5432/yuyana_dashboard_dev?schema=public"
   
   # JWT Secret (use a strong secret in production)
   JWT_SECRET="your-super-secret-jwt-key-for-local-development-environment"
   ```
   
   Replace the database credentials with your own PostgreSQL setup.

3. **Start PostgreSQL Server**
   
   Make sure your PostgreSQL server is running:
   - On macOS (with Homebrew): `brew services start postgresql`
   - On Ubuntu/Debian: `sudo systemctl start postgresql`
   - On Windows: Start the PostgreSQL service from Services app

4. **Setup Database**
   
   Run the setup script to initialize the database:
   ```bash
   node setup-db.js
   ```
   
   Or manually run:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the Development Server**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Default Credentials

After setup, you can log in with the following default credentials:
- Email: `admin@yuyana.com`
- Password: `admin123456`

Other default accounts:
- Marketing: `marketing@yuyana.com` / `marketing123456`
- Sales: `sales@yuyana.com` / `sales123456`

## Data Migration from yuyana-travel

This application can import tour data from the yuyana-travel static website using an automated extraction process:

1. Navigate to the `yuyana-travel` directory
2. Run `npm run extract` to extract data using Cheerio
3. Run `npm run validate` to check data quality
4. Navigate back to `yuyana-dashboard` directory
5. Run `./setup-tours.sh` to copy assets and import data to the database

The migration process includes:
- Automated HTML parsing using Cheerio
- Data transformation to match application schema
- Asset copying (images, documents)
- Database import with duplicate prevention
- Data validation and reporting

For more details about the migration process, see the `MIGRATION_DOCUMENTATION.md` in the yuyana-travel directory.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.