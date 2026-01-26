// ═══════════════════════════════════════════════════════════════
// 🔐 CREATE ADMIN USERS - ES MODULE COMPATIBLE VERSION
// ═══════════════════════════════════════════════════════════════
// Run: npx tsx scripts/createAdmins.ts

import  admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

// ✅ ES MODULE FIX: Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import your types
import type { UserRole } from '../types/roles.js';
import { getRolePermissions, ROLE_CONFIGS } from '../types/roles.js';

// ═══════════════════════════════════════════════════════════════
// 🔧 FIREBASE ADMIN INITIALIZATION
// ═══════════════════════════════════════════════════════════════

const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');

if (!existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: serviceAccountKey.json not found!');
  console.error('📥 Please download it from Firebase Console:');
  console.error('   Project Settings → Service Accounts → Generate New Private Key');
  console.error(`   Save it as: ${serviceAccountPath}`);
  process.exit(1);
}

// ✅ Read JSON file properly in ES modules
const serviceAccountJSON = readFileSync(serviceAccountPath, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountJSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// ═══════════════════════════════════════════════════════════════
// 👥 ADMIN USERS DATA (ALIGNED WITH YOUR TYPES)
// ═══════════════════════════════════════════════════════════════

interface AdminUserInput {
  email: string;
  password: string;
  name: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone: string;
  photoURL?: string;
}

const adminUsers: AdminUserInput[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1️⃣ SUPER ADMIN (Full Access)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'superadmin@chhattisgarhcinema.com',
    password: 'SuperAdmin@2026!SecurePass',
    name: 'Super Administrator',
    displayName: 'Super Admin',
    role: 'super_admin',
    department: 'Management',
    phone: '+91-9876543210',
    photoURL: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2️⃣ TECH ADMIN (Technical & DevOps)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'techadmin@chhattisgarhcinema.com',
    password: 'TechAdmin@2026!SecurePass',
    name: 'Technical Administrator',
    displayName: 'Tech Admin',
    role: 'tech_admin',
    department: 'Technology',
    phone: '+91-9876543211',
    photoURL: 'https://ui-avatars.com/api/?name=Tech+Admin&background=6366f1&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3️⃣ CONTENT MANAGER (Content Management)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'contentmanager@chhattisgarhcinema.com',
    password: 'ContentManager@2026!SecurePass',
    name: 'Content Management Head',
    displayName: 'Content Manager',
    role: 'content_manager',
    department: 'Content Management',
    phone: '+91-9876543212',
    photoURL: 'https://ui-avatars.com/api/?name=Content+Manager&background=8b5cf6&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4️⃣ MODERATOR (Community Moderation)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'moderator@chhattisgarhcinema.com',
    password: 'Moderator@2026!SecurePass',
    name: 'Community Moderator',
    displayName: 'Moderator',
    role: 'moderator',
    department: 'Moderation',
    phone: '+91-9876543213',
    photoURL: 'https://ui-avatars.com/api/?name=Moderator&background=f59e0b&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5️⃣ FINANCE MANAGER (Financial Operations)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'finance@chhattisgarhcinema.com',
    password: 'Finance@2026!SecurePass',
    name: 'Finance Department Head',
    displayName: 'Finance Manager',
    role: 'finance',
    department: 'Finance',
    phone: '+91-9876543214',
    photoURL: 'https://ui-avatars.com/api/?name=Finance+Manager&background=10b981&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6️⃣ ANALYST (Analytics & Marketing)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'analyst@chhattisgarhcinema.com',
    password: 'Analyst@2026!SecurePass',
    name: 'Senior Data Analyst',
    displayName: 'Data Analyst',
    role: 'analyst',
    department: 'Analytics & Marketing',
    phone: '+91-9876543215',
    photoURL: 'https://ui-avatars.com/api/?name=Data+Analyst&background=3b82f6&color=fff&size=200',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7️⃣ CONTENT CREATOR (Featured Creator)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    email: 'creator@chhattisgarhcinema.com',
    password: 'Creator@2026!SecurePass',
    name: 'Featured Content Creator',
    displayName: 'Content Creator',
    role: 'creator',
    department: 'Content Creation',
    phone: '+91-9876543216',
    photoURL: 'https://ui-avatars.com/api/?name=Content+Creator&background=ec4899&color=fff&size=200',
  },
];

// ═══════════════════════════════════════════════════════════════
// 🎨 CONSOLE COLORS
// ═══════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// ═══════════════════════════════════════════════════════════════
// 🚀 CREATE ADMIN USER FUNCTION
// ═══════════════════════════════════════════════════════════════

async function createAdminUser(userData: AdminUserInput): Promise<{
  success: boolean;
  uid?: string;
  error?: string;
}> {
  try {
    log.info(`Creating: ${userData.email}`);
    log.info(`Role: ${userData.role}`);
    log.info(`Department: ${userData.department}`);

    // Step 1: Create or get Firebase Auth user
    let userRecord: admin.auth.UserRecord;
    
    try {
      userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: true,
      });
      log.success(`Firebase Auth user created: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        log.warning('User already exists, updating existing user...');
        userRecord = await auth.getUserByEmail(userData.email);
        
        // Update existing user
        await auth.updateUser(userRecord.uid, {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          emailVerified: true,
        });
        log.success(`Existing user updated: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Step 2: Set custom claims
    const customClaims = {
      role: userData.role,
      admin: true,
      department: userData.department,
    };
    
    await auth.setCustomUserClaims(userRecord.uid, customClaims);
    log.success('Custom claims set');

    // Step 3: Get permissions for role
    const permissions = getRolePermissions(userData.role).map(p => p.toString());
    const roleConfig = ROLE_CONFIGS[userData.role];
    
    log.success(`${permissions.length} permissions assigned`);

    // Step 4: Create Firestore admin document (✅ NO NULL/UNDEFINED VALUES)
    const adminData: Record<string, any> = {
      // Core Identity
      uid: userRecord.uid,
      email: userData.email,
      name: userData.name,
      displayName: userData.displayName,
      
      // Role & Department
      role: userData.role,
      department: userData.department,
      
      // Permissions
      permissions: permissions,
      
      // Assignment Info
      assignedBy: 'system',
      assignedAt: new Date().toISOString(),
      
      // Contact
      phone: userData.phone,
      
      // Status
      status: 'active',
      isActive: true,
      
      // Security
      loginAttempts: 0,
      
      // Activity
      activityLogs: [],
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ✅ Add optional fields only if they exist
    if (userData.photoURL) {
      adminData.photoURL = userData.photoURL;
    }

    await db.collection('admins').doc(userRecord.uid).set(adminData);
    log.success('Firestore admin document created');

    console.log('');
    log.success(`${userData.displayName} created successfully!`);
    log.info(`Email: ${userData.email}`);
    log.info(`Password: ${userData.password}`);
    log.info(`UID: ${userRecord.uid}`);
    log.info(`Permissions: ${permissions.length}`);
    log.info(`Level: ${roleConfig.level}`);
    console.log('───────────────────────────────────────────────────────────\n');

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    log.error(`Failed to create ${userData.email}`);
    console.error('Error:', error.message);
    console.log('───────────────────────────────────────────────────────────\n');
    return { success: false, error: error.message };
  }
}


// ═══════════════════════════════════════════════════════════════
// 🎬 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n');
  log.header('═══════════════════════════════════════════════════════════');
  log.header('🚀 CHHATTISGARH CINEMA - ADMIN USERS CREATION');
  log.header('═══════════════════════════════════════════════════════════');
  console.log('\n');

  const results: Array<{ email: string; role: string; success: boolean; uid?: string; error?: string }> = [];

  // Create each admin user
  for (const userData of adminUsers) {
    const result = await createAdminUser(userData);
    results.push({
      email: userData.email,
      role: userData.role,
      success: result.success,
      uid: result.uid,
      error: result.error,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════

  console.log('\n');
  log.header('═══════════════════════════════════════════════════════════');
  log.header('📊 CREATION SUMMARY');
  log.header('═══════════════════════════════════════════════════════════');
  console.log('\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.success(`Successful: ${successful}/${adminUsers.length}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}/${adminUsers.length}`);
  }
  console.log('\n');

  log.header('═══════════════════════════════════════════════════════════');
  log.header('🔐 LOGIN CREDENTIALS');
  log.header('═══════════════════════════════════════════════════════════');
  console.log('\n');

  adminUsers.forEach((user, index) => {
    const result = results[index];
    const status = result.success ? '✅' : '❌';
    const roleConfig = ROLE_CONFIGS[user.role];

    console.log(`${status} ${index + 1}. ${user.displayName} (${roleConfig.name})`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log(`   🏢 Department: ${user.department}`);
    console.log(`   📞 Phone: ${user.phone}`);
    console.log(`   🎯 Level: ${roleConfig.level}`);

    if (result.success && result.uid) {
      console.log(`   🆔 UID: ${result.uid}`);
      console.log(`   🔐 Permissions: ${getRolePermissions(user.role).length}`);
    }

    if (!result.success && result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }

    console.log('');
  });

  log.header('═══════════════════════════════════════════════════════════');
  log.header('⚠️  SECURITY REMINDERS');
  log.header('═══════════════════════════════════════════════════════════');
  console.log('\n');
  log.warning('1. Change all passwords immediately in production!');
  log.warning('2. Enable 2FA for all admin accounts');
  log.warning('3. Keep serviceAccountKey.json secure and never commit to git');
  log.warning('4. Review admin permissions regularly');
  log.warning('5. Monitor admin activity logs');
  console.log('\n');

  log.header('═══════════════════════════════════════════════════════════');
  log.success('✅ ALL DONE! Admin panel ready at: /admin/login');
  log.header('═══════════════════════════════════════════════════════════');
  console.log('\n');
}

// Run the script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    log.error('FATAL ERROR:');
    console.error(error);
    process.exit(1);
  });
