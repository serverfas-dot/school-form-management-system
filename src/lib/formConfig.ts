import { supabase } from './supabase';

export interface FormConfiguration {
  id: string;
  form_type: string;
  title: string;
  subtitle: string;
  success_message: string;
  button_text: string;
  additional_config: {
    landing_title?: string;
    landing_title_dv?: string;
    landing_description?: string;
    section_headings?: {
      activities?: string;
      info?: string;
      note?: string;
      other_activity?: string;
    };
    activity_options?: string[];
    field_labels?: {
      name?: string;
      child_student?: string;
      blood_group?: string;
      mobile_number?: string;
      additional_mobile?: string;
      arrangement?: string;
      office_number?: string;
      other_activity_placeholder?: string;
      blood_group_placeholder?: string;
      designation?: string;
      address?: string;
      id_number?: string;
      email?: string;
      phone_number?: string;
    };
    card_details?: string[];
  };
}

const defaultConfigs: Record<string, FormConfiguration> = {
  stationery: {
    id: '',
    form_type: 'stationery',
    title: 'Stationery Voucher Request Form',
    subtitle: 'Academic Year 2026',
    success_message: 'Your stationery voucher request has been submitted successfully!',
    button_text: 'Submit Request',
    additional_config: {
      landing_title: 'Stationery Voucher Request',
      landing_description: 'Submit your stationery voucher request for Academic Year 2026'
    }
  },
  'office-items': {
    id: '',
    form_type: 'office-items',
    title: 'Office Items Request Form',
    subtitle: 'Request items for your organization',
    success_message: 'Your office items request has been submitted successfully!',
    button_text: 'Submit Request',
    additional_config: {
      landing_title: 'Office Items Request',
      landing_description: 'Request office items for your organization or department'
    }
  },
  volunteer: {
    id: '',
    form_type: 'volunteer',
    title: 'ވޮލަންޓިއަރ ރަޖިސްޓްރޭޝަން ފޯމު',
    subtitle: 'އަންހެނުން ވޮލިންޓިއަރއަކަށް ވުމަށް އެދޭ ފޯމް',
    success_message: 'ތިޔަބޭފުޅުންގެ ފޯމު ކާމިޔާބުކަމާއެކު ހުށަހަޅައިފި',
    button_text: 'ހުށަހެޅުން',
    additional_config: {
      landing_title: 'Volunteer Registration',
      landing_title_dv: 'ވޮލަންޓިއަރ ރަޖިސްޓްރޭޝަން ފޯމު',
      landing_description: 'Register to become a school volunteer',
      section_headings: {
        activities: 'ވަޒީފާ / ބޯޑުތައް / ގްރޫޕްތައް އިޚްތިޔާރުކުރައްވާ',
        info: 'މައުލޫމާތު',
        note: 'ނޯޓް',
        other_activity: 'އެހެނިހެން:'
      },
      activity_options: [
        'ތިލަވުގެ އުފެއްދުންތެރިކަމާބެހޭ ހުނަރު ވެރި ކުދީންގެ ގްރޫޕް',
        'ބައިސްކޯޕް، ސާންސް ސެންޓާރު، ލައިބްރަރީ ބޯޑު',
        'ބައްތިކުޅި މުބާރާތު ކޯޗިންގ ބޯޑު',
        'ކުދިން ފޯރިސް ކޭސްކުރުމަށް މެނޭޖުކުރުން ބޯޑު',
        'ބައްތިކުޅި މުބާރާތުގައި މަސައްކަތް ކުރުން ބޯޑު',
        'ވޮލަންޓިއާ ސްކޮލަރޝިޕް ބޯޑު',
        'ބަސްލަން އެސިސްޓް (6 ވަނަ)',
        'ބަސްލަން، ވޮލަންޓިއާރުގެ ކޯޗިންގ، މަސައްކަތް، ކުދިން މަޑުކޮށް ބޯޑު'
      ],
      field_labels: {
        name: 'ނަން',
        child_student: 'ދަރީ',
        blood_group: 'ރަތް ގުރޫޕް',
        mobile_number: 'މޯބައިލް ނަމްބަރެއް',
        additional_mobile: 'އިތުރު މޯބައިލް ނަމްބަރެއް',
        arrangement: 'އިންތިޒާމް',
        office_number: 'އޮފީސް ނަމްބަރެއް',
        other_activity_placeholder: 'އެހެން މަސައްކަތެއް ލިޔުއްވާ',
        blood_group_placeholder: 'A+, B+, O+, AB+'
      },
      card_details: [
        '• Volunteer Activities',
        '• Personal Information',
        '• Contact Details',
        '• Emergency Contact'
      ]
    }
  }
};

export async function getFormConfiguration(formType: string): Promise<FormConfiguration> {
  try {
    const { data, error } = await supabase
      .from('form_configurations')
      .select('*')
      .eq('form_type', formType)
      .maybeSingle();

    if (error) {
      console.error('Error fetching form configuration:', error);
      return defaultConfigs[formType] || defaultConfigs.stationery;
    }

    return data || defaultConfigs[formType] || defaultConfigs.stationery;
  } catch (error) {
    console.error('Error in getFormConfiguration:', error);
    return defaultConfigs[formType] || defaultConfigs.stationery;
  }
}
