-- Can Do ATL Supabase preview seed — generated from current managed content.

-- Media values temporarily point to the current public site while files are copied into the site-media bucket.

INSERT INTO "impactMetrics" ("metricKey", "value", "label", "position", "updatedBy") VALUES
('care_packages', 0, 'care packages shared so far — you can make the difference', 0, 0),
('clothing_items', 0, 'clothing items recirculated so far — you can make the difference', 1, 0),
('student_volunteers', 0, 'student volunteers so far — you can make the difference', 2, 0)
ON CONFLICT ("metricKey") DO UPDATE SET "value" = EXCLUDED."value", "label" = EXCLUDED."label", "position" = EXCLUDED."position", "updatedBy" = EXCLUDED."updatedBy";

INSERT INTO "events" ("title", "campus", "details", "startsAt", "endsAt", "linkHref", "isPublished", "createdBy") VALUES
('i love pepper', 'Georgia Tech', NULL, '2026-08-13T12:56:00.000Z', '2026-08-29T12:56:00.000Z', NULL, true, 0)
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "campus" = EXCLUDED."campus", "details" = EXCLUDED."details", "startsAt" = EXCLUDED."startsAt", "endsAt" = EXCLUDED."endsAt", "linkHref" = EXCLUDED."linkHref", "isPublished" = EXCLUDED."isPublished", "createdBy" = EXCLUDED."createdBy";

INSERT INTO "teamMembers" ("name", "role", "bio", "imageUrl", "imageKey", "linkedinUrl", "instagramUrl", "facebookUrl", "tiktokUrl", "youtubeUrl", "websiteUrl", "position", "isPublished", "createdBy") VALUES
('Rabiatou Ndiaye', 'Founder - President', 'Intern | GSU MUN Chief of Staff | B.A./ M.A. - Political Science Major', NULL, NULL, 'https://www.linkedin.com/in/rabiatou-n-582275241/', NULL, NULL, NULL, NULL, NULL, 0, true, 0),
('Maryam Hassan Mohamed', 'Developer - Logistics manager', 'Honors Chemistry @ GeorgiaTech | TEDx Speaker', NULL, NULL, 'https://www.linkedin.com/in/maryam-abdishakur-hassan-mohamed777/', NULL, NULL, NULL, NULL, NULL, 1, true, 0),
('Meron Cherecho', 'Social Media Director', 'Student at Georgia State University, looking for a bright future, a good career and meeting new people.', NULL, NULL, 'https://www.linkedin.com/in/meron-cherecho-8b31aa2a2/', NULL, NULL, NULL, NULL, NULL, 2, true, 0),
('Gaby Morales-Ozuna', 'Vice President', 'Student at Kennesaw State University', NULL, NULL, 'https://www.linkedin.com/in/gaby-morales-ozuna-a31abb1b0/', NULL, NULL, NULL, NULL, NULL, 3, true, 0)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "role" = EXCLUDED."role", "bio" = EXCLUDED."bio", "imageUrl" = EXCLUDED."imageUrl", "imageKey" = EXCLUDED."imageKey", "linkedinUrl" = EXCLUDED."linkedinUrl", "instagramUrl" = EXCLUDED."instagramUrl", "facebookUrl" = EXCLUDED."facebookUrl", "tiktokUrl" = EXCLUDED."tiktokUrl", "youtubeUrl" = EXCLUDED."youtubeUrl", "websiteUrl" = EXCLUDED."websiteUrl", "position" = EXCLUDED."position", "isPublished" = EXCLUDED."isPublished", "createdBy" = EXCLUDED."createdBy";

INSERT INTO "siteText" ("textKey", "value", "updatedBy") VALUES
('impactKicker', 'Our impact', 0),
('whatWeDoKicker', 'What we do', 0),
('whatWeDoHeading', 'Care is practical.', 0),
('impactBody', 'When a student has food on the table or clothes that feel ready for the day, a community grows stronger.', 0),
('whatWeDoBody', 'We mobilize people, supplies, and campus partnerships so a student’s next step can feel a little more possible.', 0),
('impactHeading', 'Every item carries a little more room to breathe.', 0),
('heroNote', 'Bring what you can. Take what helps.', 0),
('impactBadge', 'A growing community, one drive at a time', 0),
('eventsBody', 'Plan around the next chance to pack, sort, share, and make a useful difference close to campus.', 0),
('storiesKicker', 'The way we show up', 0),
('storiesHeading', 'Care moves through people.', 0),
('storyOneTitle', 'A full shelf can steady a week.', 0),
('storiesBody', 'Food and clothing access is never a one-person fix. Here is the shared work that keeps care moving across our campuses.', 0),
('storyOneContext', 'Food access, made tangible.', 0),
('storyOneBody', 'Food drives turn everyday supplies into breathing room—one grocery bag, one meal, one less worry at a time.', 0),
('storyTwoTitle', 'A good outfit can change how the day begins.', 0),
('storyTwoBody', 'Closet days keep quality clothing in circulation for class, work, interviews, and all the in-between moments.', 0),
('storyTwoContext', 'Clothing access, shared freely.', 0),
('storyThreeTitle', 'Showing up is a skill we share.', 0),
('storyThreeBody', 'Packed bags, sorted racks, and welcoming tables begin when students decide to make room for one another.', 0),
('storyThreeContext', 'Mutual aid, in motion.', 0),
('actionBody', 'Show up for a shift, organize a drive, pass along essentials, or help us keep this campus trail moving.', 0),
('actionHeading', 'What can you carry forward?', 0),
('actionKicker', 'Make room for someone else', 0),
('volunteerSubtext', 'Sort, deliver, organize, and welcome', 0),
('essentialsSubtext', 'Fuel food and clothing access', 0),
('essentialsLabel', 'Give essentials', 0),
('footerDescription', 'Three campuses, one connected care network, and a shared belief that essentials should never stand in the way of a student’s next step.', 0),
('volunteerLabel', 'Volunteer with us', 0),
('socialHelper', 'Follow the work. Share a drive. Keep the trail moving.', 0),
('footerTagline', 'Built for shared strength.', 0),
('aboutHeading', 'We make room for each other.', 0),
('aboutIntro', 'Can Do ATL is a student-led, multi-campus organization building practical paths to food and clothing access across Georgia Tech, Georgia State, and Kennesaw State.', 0),
('joinHeading', 'There is room at this table.', 0),
('teamKicker', 'The people behind the work', 0),
('joinKicker', 'Want to join the work?', 0),
('teamHeading', 'Our team, in their own words.', 0),
('teamIntro', 'Click a profile to learn more and find each person’s linked social spaces. Team profiles are managed directly from the private staff workspace.', 0),
('joinBody', 'Bring your organizing skills, practical ideas, or an hour to help. Every contribution strengthens the campus trail.', 0),
('eventsKicker', 'Mark your calendar', 0),
('eventsHeading', 'Meet us where care is needed.', 0)
ON CONFLICT ("textKey") DO UPDATE SET "value" = EXCLUDED."value", "updatedBy" = EXCLUDED."updatedBy";

INSERT INTO "serviceCards" ("cardKey", "imageUrl", "imageKey", "hoverImageUrl", "hoverImageKey", "imageAlt", "position", "updatedBy") VALUES
('food_drives', '', NULL, '', NULL, 'Students organizing food drive supplies', 0, 0),
('clothing_closet', '', NULL, '', NULL, 'Students organizing clothing donations', 1, 0),
('community_outreach', '', NULL, '', NULL, 'Students sharing community care kits', 2, 0)
ON CONFLICT ("cardKey") DO UPDATE SET "imageUrl" = EXCLUDED."imageUrl", "imageKey" = EXCLUDED."imageKey", "hoverImageUrl" = EXCLUDED."hoverImageUrl", "hoverImageKey" = EXCLUDED."hoverImageKey", "imageAlt" = EXCLUDED."imageAlt", "position" = EXCLUDED."position", "updatedBy" = EXCLUDED."updatedBy";

INSERT INTO "siteAppearance" ("id", "siteName", "tabTitle", "logoUrl", "logoKey", "logoAlt", "primaryColor", "accentColor", "highlightColor", "inkColor", "buttonShape", "pageMode", "pageColor", "pageGradientFrom", "pageGradientTo", "pageImageUrl", "pageImageKey", "pageImageBlur", "pageOverlayOpacity", "headerMode", "headerColor", "headerGradientFrom", "headerGradientTo", "headerImageUrl", "headerImageKey", "headerImageBlur", "headerOverlayOpacity", "footerMode", "footerColor", "footerGradientFrom", "footerGradientTo", "footerImageUrl", "footerImageKey", "footerImageBlur", "footerOverlayOpacity", "updatedBy") VALUES
(1, 'Can Do ATL', 'Can Do ATL — Student-led mutual aid', '', NULL, 'Atlanta pencil surrounded by grocery essentials', '#3A5A40', '#BC6C25', '#F1CB6B', '#2C2C2C', 'pill', 'solid', '#F7F3EB', '#F7F3EB', '#E7EDE1', NULL, NULL, 0, 24, 'solid', '#F7F3EB', '#F7F3EB', '#F7F3EB', NULL, NULL, 0, 8, 'gradient', '#2C2C2C', '#2C2C2C', '#3A5A40', NULL, NULL, 0, 36, 0)
ON CONFLICT ("id") DO UPDATE SET "siteName" = EXCLUDED."siteName", "tabTitle" = EXCLUDED."tabTitle", "logoUrl" = EXCLUDED."logoUrl", "logoKey" = EXCLUDED."logoKey", "logoAlt" = EXCLUDED."logoAlt", "primaryColor" = EXCLUDED."primaryColor", "accentColor" = EXCLUDED."accentColor", "highlightColor" = EXCLUDED."highlightColor", "inkColor" = EXCLUDED."inkColor", "buttonShape" = EXCLUDED."buttonShape", "pageMode" = EXCLUDED."pageMode", "pageColor" = EXCLUDED."pageColor", "pageGradientFrom" = EXCLUDED."pageGradientFrom", "pageGradientTo" = EXCLUDED."pageGradientTo", "pageImageUrl" = EXCLUDED."pageImageUrl", "pageImageKey" = EXCLUDED."pageImageKey", "pageImageBlur" = EXCLUDED."pageImageBlur", "pageOverlayOpacity" = EXCLUDED."pageOverlayOpacity", "headerMode" = EXCLUDED."headerMode", "headerColor" = EXCLUDED."headerColor", "headerGradientFrom" = EXCLUDED."headerGradientFrom", "headerGradientTo" = EXCLUDED."headerGradientTo", "headerImageUrl" = EXCLUDED."headerImageUrl", "headerImageKey" = EXCLUDED."headerImageKey", "headerImageBlur" = EXCLUDED."headerImageBlur", "headerOverlayOpacity" = EXCLUDED."headerOverlayOpacity", "footerMode" = EXCLUDED."footerMode", "footerColor" = EXCLUDED."footerColor", "footerGradientFrom" = EXCLUDED."footerGradientFrom", "footerGradientTo" = EXCLUDED."footerGradientTo", "footerImageUrl" = EXCLUDED."footerImageUrl", "footerImageKey" = EXCLUDED."footerImageKey", "footerImageBlur" = EXCLUDED."footerImageBlur", "footerOverlayOpacity" = EXCLUDED."footerOverlayOpacity", "updatedBy" = EXCLUDED."updatedBy";

INSERT INTO "adminInvites" ("email", "status", "invitedBy") VALUES
('candoatltm@gmail.com', 'pending', 0),
('mary2000skid@gmail.com', 'pending', 0)
ON CONFLICT ("email") DO UPDATE SET "status" = EXCLUDED."status", "invitedBy" = EXCLUDED."invitedBy";
