
import { JobCategory, InterviewType, CompanyType, ExperienceLevel } from './types';

export const JOB_ROLES_MAP: Record<JobCategory, string[]> = {
  [JobCategory.SOFTWARE_IT]: [
    'Software Engineer', 'Full Stack Developer', 'Backend Developer', 
    'Frontend Developer', 'Data Scientist', 'AI/ML Engineer', 
    'DevOps Engineer', 'Cybersecurity Analyst'
  ],
  [JobCategory.CORE_ENGINEERING]: [
    'Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Electronics Engineer'
  ],
  [JobCategory.BUSINESS_MGMT]: [
    'Product Manager', 'Business Analyst', 'Operations Manager', 'MBA / Consulting roles'
  ],
  [JobCategory.FINANCE_COMMERCE]: [
    'Financial Analyst', 'Accountant', 'Investment Banking roles', 'CA / CFA preparation'
  ],
  [JobCategory.SALES_MARKETING]: [
    'Sales Executive', 'Digital Marketer', 'Growth Marketer', 'Customer Success Manager'
  ],
  [JobCategory.HR_NON_TECH]: [
    'HR Executive', 'Recruiter', 'Talent Acquisition', 'Operations & Admin roles'
  ],
  [JobCategory.DESIGN_CREATIVE]: [
    'UI/UX Designer', 'Graphic Designer', 'Content Writer', 'Video Editor'
  ],
  [JobCategory.HEALTHCARE_MISC]: [
    'Hospital Administration', 'Healthcare IT', 'Support & Service roles'
  ]
};

export const INTERVIEW_TYPES = Object.values(InterviewType);
export const COMPANY_TYPES = Object.values(CompanyType);
export const EXPERIENCE_LEVELS = Object.values(ExperienceLevel);

export const EVALUATION_DIMENSIONS = [
  'domainKnowledge', 'problemSolving', 'logicalThinking', 'communication', 
  'clarityStructure', 'confidence', 'tone', 'behavioralSTAR', 
  'decisionMaking', 'culturalFit', 'timeManagement', 'ethicalReasoning',
  'leadership', 'technicalAccuracy', 'creativityInnovation'
];
