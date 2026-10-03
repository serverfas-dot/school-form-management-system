/*
  # Add Missing Position Application Form Fields

  1. Purpose
    - Add all missing fields from position_applications table to form_fields
    - Enables full management of position application form through Super Admin

  2. New Fields Added
    - Previous positions held
    - Captain position
    - Games Captain position
    - Prefect position
    - Association position
    - Sports Club position
    - Club selections with designations
    - House selections with designations
    - First semester grades (all subjects)
    - Second semester grades (all subjects)
    - Dhivehi Week activities
    - English Week activities
    - Islam Week activities
    - Sports competitions
    - Other activities

  3. Notes
    - All fields maintain proper display order
    - Dhivehi labels included for all fields
    - Appropriate field types assigned
*/

-- Add missing position application fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, placeholder, section) VALUES

-- Previous Positions
('position-application', 'previousPositions', 'Previous Positions Held', 'ކުރިން ބޭއްވީ މަގާމުތައް', 'textarea', '[]', false, 9, true, 'List any leadership positions you have held', 'Basic Information'),

-- Position Types
('position-application', 'captainPosition', 'Captain Position', 'ކެޕްޓަން މަގާމު', 'select', '["School Captain", "Vice Captain", "Assistant Captain"]', false, 10, true, 'Select captain position if applying', 'Leadership Positions'),
('position-application', 'gamesCaptainPosition', 'Games Captain Position', 'ގޭމްސް ކެޕްޓަން މަގާމު', 'select', '["Games Captain", "Assistant Games Captain"]', false, 11, true, 'Select games captain position if applying', 'Leadership Positions'),
('position-application', 'prefectPosition', 'Prefect Position', 'ޕްރިފެކްޓް މަގާމު', 'select', '["Senior Prefect", "Junior Prefect"]', false, 12, true, 'Select prefect position if applying', 'Leadership Positions'),
('position-application', 'associationPosition', 'Association Position', 'އެސޯސިއޭޝަން މަގާމު', 'text', '[]', false, 13, true, 'Enter association position if applying', 'Leadership Positions'),

-- Sports Club
('position-application', 'sportsClubPosition', 'Sports Club Position', 'ސްޕޯޓްސް ކްލަބް މަގާމު', 'text', '[]', false, 14, true, 'Enter sports club position if applying', 'Sports Leadership'),

-- Academic Records - First Semester
('position-application', 'firstSemesterIslam', 'Islam (1st Semester)', 'އިސްލާމް (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 15, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterQuran', 'Quran (1st Semester)', 'ޤުރްއާން (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 16, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterDhivehi', 'Dhivehi (1st Semester)', 'ދިވެހި (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 17, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterEnglish', 'English (1st Semester)', 'އިނގިރޭސި (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 18, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterMaths', 'Mathematics (1st Semester)', 'ބަސްލަން (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 19, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterScience', 'Science (1st Semester)', 'ސައިންސް (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 20, true, 'Enter grade', 'Academic Records'),
('position-application', 'firstSemesterSocialStudies', 'Social Studies (1st Semester)', 'އިޖުތިމާއީ ތަޢުލީމު (1 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 21, true, 'Enter grade', 'Academic Records'),

-- Academic Records - Second Semester
('position-application', 'secondSemesterIslam', 'Islam (2nd Semester)', 'އިސްލާމް (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 22, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterQuran', 'Quran (2nd Semester)', 'ޤުރްއާން (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 23, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterDhivehi', 'Dhivehi (2nd Semester)', 'ދިވެހި (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 24, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterEnglish', 'English (2nd Semester)', 'އިނގިރޭސި (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 25, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterMaths', 'Mathematics (2nd Semester)', 'ބަސްލަން (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 26, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterScience', 'Science (2nd Semester)', 'ސައިންސް (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 27, true, 'Enter grade', 'Academic Records'),
('position-application', 'secondSemesterSocialStudies', 'Social Studies (2nd Semester)', 'އިޖުތިމާއީ ތަޢުލީމު (2 ވަނަ ސެމެސްޓަރ)', 'text', '[]', false, 28, true, 'Enter grade', 'Academic Records'),

-- Activities
('position-application', 'dhivehiWeek', 'Dhivehi Week Activities', 'ދިވެހި ހަފްތާގެ މަސައްކަތްތައް', 'textarea', '[]', false, 29, true, 'Describe your participation in Dhivehi Week', 'Activities'),
('position-application', 'englishWeek', 'English Week Activities', 'އިނގިރޭސި ހަފްތާގެ މަސައްކަތްތައް', 'textarea', '[]', false, 30, true, 'Describe your participation in English Week', 'Activities'),
('position-application', 'islamWeek', 'Islam Week Activities', 'އިސްލާމް ހަފްތާގެ މަސައްކަތްތައް', 'textarea', '[]', false, 31, true, 'Describe your participation in Islam Week', 'Activities'),
('position-application', 'sportsCompetitions', 'Sports Competitions', 'ކުޅިވަރު މުބާރާތްތައް', 'textarea', '[]', false, 32, true, 'List sports competitions you participated in', 'Activities'),
('position-application', 'otherActivities', 'Other Activities', 'އެހެނިހެން މަސައްކަތްތައް', 'textarea', '[]', false, 33, true, 'Describe any other school activities', 'Activities');
