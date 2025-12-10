import { OrgChartNode, OnboardingStep, User } from '@/types'

export const mockOrgChart: OrgChartNode = {
  id: 'founder_001',
  name: 'Jamie Williams',
  position: 'CEO & Founder',
  department: 'Executive',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jamie',
  children: [
    {
      id: 'emp_001',
      name: 'Sarah Chen',
      position: 'VP of Engineering',
      department: 'Engineering',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      manager_id: 'founder_001',
      children: [
        {
          id: 'emp_002',
          name: 'Marcus Johnson',
          position: 'Senior Developer',
          department: 'Engineering',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          manager_id: 'emp_001',
        },
        {
          id: 'emp_004',
          name: 'Alex Kim',
          position: 'Backend Developer',
          department: 'Engineering',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          manager_id: 'emp_001',
        },
      ],
    },
    {
      id: 'emp_003',
      name: 'Emily Rodriguez',
      position: 'Head of Design',
      department: 'Design',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      manager_id: 'founder_001',
      children: [
        {
          id: 'emp_005',
          name: 'Jordan Lee',
          position: 'UI/UX Designer',
          department: 'Design',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
          manager_id: 'emp_003',
        },
      ],
    },
  ],
}

export const mockOnboardingSteps: OnboardingStep[] = [
  {
    id: 'step_001',
    title: 'Complete Your Profile',
    description: 'Add your photo, bio, and contact information',
    category: 'personal',
    order: 1,
    required: true,
  },
  {
    id: 'step_002',
    title: 'Review Company Handbook',
    description: 'Read through our company policies and culture guide',
    category: 'company',
    order: 2,
    required: true,
  },
  {
    id: 'step_003',
    title: 'Set Up Development Environment',
    description: 'Install required tools and configure your workspace',
    category: 'tools',
    order: 3,
    required: true,
  },
  {
    id: 'step_004',
    title: 'Connect GitHub Account',
    description: 'Link your GitHub account for repository access',
    category: 'tools',
    order: 4,
    required: true,
  },
  {
    id: 'step_005',
    title: 'Complete Deel Profile',
    description: 'Set up your payment and tax information in Deel',
    category: 'tools',
    order: 5,
    required: true,
  },
  {
    id: 'step_006',
    title: 'Meet Your Team',
    description: 'Schedule 1:1s with your team members',
    category: 'team',
    order: 6,
    required: false,
  },
  {
    id: 'step_007',
    title: 'Meet Your Manager',
    description: 'Have an introductory meeting with your direct manager',
    category: 'team',
    order: 7,
    required: true,
  },
  {
    id: 'step_008',
    title: 'Security Training',
    description: 'Complete the mandatory security awareness training',
    category: 'company',
    order: 8,
    required: true,
  },
]

export const mockUsers: User[] = [
  {
    id: 'founder_001',
    email: 'jamie@acme-startup.com',
    name: 'Jamie Williams',
    role: 'founder',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jamie',
    organization_id: 'org_001',
    position: 'CEO & Founder',
    department: 'Executive',
    onboarding_completed: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp_001',
    email: 'sarah@acme-startup.com',
    name: 'Sarah Chen',
    role: 'employee',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    organization_id: 'org_001',
    position: 'VP of Engineering',
    department: 'Engineering',
    manager_id: 'founder_001',
    onboarding_completed: true,
    created_at: '2024-01-15T00:00:00Z',
  },
]

export async function getOrgChartData() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    orgChart: mockOrgChart,
    onboardingSteps: mockOnboardingSteps,
    users: mockUsers,
  }
}

