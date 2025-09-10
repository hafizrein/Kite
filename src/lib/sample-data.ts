import { User, Account } from './types';
import { usersService, accountsService } from './firestore';

// Sample users with different roles for testing dropdowns
export const sampleUsers: Omit<User, 'id'>[] = [
  {
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'Admin',
    department: 'Management',
    hourlyRate: 100
  },
  {
    name: 'Sarah Sales',
    email: 'sales@example.com', 
    role: 'Sales',
    department: 'Sales',
    hourlyRate: 80
  },
  {
    name: 'Mike PM',
    email: 'pm@example.com',
    role: 'PM',
    department: 'Project Management', 
    hourlyRate: 90
  },
  {
    name: 'Lisa Developer',
    email: 'dev@example.com',
    role: 'Member',
    department: 'Engineering',
    hourlyRate: 85
  }
];

// Sample accounts for testing
export const sampleAccounts: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Tech Corp',
    industry: 'Technology',
    website: 'https://techcorp.com',
    phone: '+1-555-0001',
    email: 'contact@techcorp.com',
    address: '123 Tech St, Silicon Valley, CA',
    ownerId: '' // Will be set when creating
  },
  {
    name: 'Health Solutions Inc',
    industry: 'Healthcare', 
    website: 'https://healthsolutions.com',
    phone: '+1-555-0002',
    email: 'info@healthsolutions.com',
    address: '456 Medical Ave, Boston, MA',
    ownerId: '' // Will be set when creating
  },
  {
    name: 'Finance Pro LLC',
    industry: 'Finance',
    website: 'https://financepro.com', 
    phone: '+1-555-0003',
    email: 'hello@financepro.com',
    address: '789 Wall St, New York, NY',
    ownerId: '' // Will be set when creating
  }
];

// Function to create sample data if none exists
export async function createSampleDataIfNeeded() {
  try {
    console.log('Checking if sample data is needed...');
    
    // Check if users exist
    const existingUsers = await usersService.getAll();
    console.log(`Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length === 0) {
      console.log('Creating sample users...');
      const createdUserIds: string[] = [];
      
      for (const userData of sampleUsers) {
        const userId = await usersService.create({
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any);
        createdUserIds.push(userId);
        console.log(`Created user: ${userData.name} (${userData.role})`);
      }
      
      // Check if accounts exist
      const existingAccounts = await accountsService.getAll();
      console.log(`Found ${existingAccounts.length} existing accounts`);
      
      if (existingAccounts.length === 0 && createdUserIds.length > 0) {
        console.log('Creating sample accounts...');
        
        // Assign accounts to sales/admin users
        const salesAdminUsers = createdUserIds.slice(0, 2); // First two users (Admin and Sales)
        
        for (let i = 0; i < sampleAccounts.length; i++) {
          const accountData = {
            ...sampleAccounts[i],
            ownerId: salesAdminUsers[i % salesAdminUsers.length], // Round-robin assignment
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const accountId = await accountsService.create(accountData);
          console.log(`Created account: ${accountData.name}`);
        }
      }
      
      console.log('Sample data creation completed!');
      return true;
    }
    
    console.log('Sample data already exists, skipping creation');
    return false;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
}



