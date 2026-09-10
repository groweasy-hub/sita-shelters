CREATE TABLE IF NOT EXISTS `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text COLLATE NOCASE NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('planning', 'active', 'on-hold', 'completed')),
	`project_manager_id` text NOT NULL,
	`start_date` text NOT NULL,
	`estimated_completion_date` text NOT NULL,
	`progress_percent` integer DEFAULT 0 NOT NULL CHECK (`progress_percent` BETWEEN 0 AND 100),
	`description` text NOT NULL,
	`address_line_1` text NOT NULL,
	`address_line_2` text,
	`landmark` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postal_code` text NOT NULL,
	`country` text DEFAULT 'India' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `projects_code_unique` ON `projects` (`code` COLLATE NOCASE);
--> statement-breakpoint
INSERT OR IGNORE INTO `projects` (`id`, `code`, `name`, `status`, `project_manager_id`, `start_date`, `estimated_completion_date`, `progress_percent`, `description`, `address_line_1`, `address_line_2`, `landmark`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES
	('sita-heights', 'SS-001', 'SITA Heights', 'active', 'usr-manoj-verma', '2025-01-12', '2027-03-31', 72, 'Twin-tower premium residential development, Tower A-D.', 'Plot 14, Financial District', 'Gachibowli', 'Near Wipro Circle', 'Hyderabad', 'Telangana', '500032', 'India', '2025-01-08T00:00:00.000Z', '2025-01-08T00:00:00.000Z'),
	('sita-enclave', 'SS-002', 'SITA Enclave', 'active', 'usr-manoj-verma', '2025-04-01', '2027-09-30', 58, 'Mixed-use residential enclave with retail podium.', 'Survey No. 82/4, Sarjapur Main Road', 'Kaikondrahalli', 'Opposite Wipro Corporate Office', 'Bengaluru', 'Karnataka', '560035', 'India', '2025-01-07T00:00:00.000Z', '2025-01-07T00:00:00.000Z'),
	('sita-greens', 'SS-003', 'SITA Greens', 'planning', 'usr-sneha-kapoor', '2026-06-01', '2028-12-31', 6, 'Low-rise villa community around a central green.', 'Plot 31, Phase 2 Road', 'Hinjewadi Rajiv Gandhi Infotech Park', 'Near Maan Road Junction', 'Pune', 'Maharashtra', '411057', 'India', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
	('sita-grove', 'SS-004', 'SITA Grove', 'active', 'usr-sneha-kapoor', '2024-11-15', '2026-12-31', 48, 'Phase II high-rise apartments with clubhouse.', 'Site 19, ECC Road', 'Whitefield', 'Near Deens Academy', 'Bengaluru', 'Karnataka', '560066', 'India', '2025-01-05T00:00:00.000Z', '2025-01-05T00:00:00.000Z'),
	('sita-meridian', 'SS-005', 'SITA Meridian', 'active', 'usr-sneha-kapoor', '2025-02-20', '2027-06-30', 31, 'Blocks 1-3 of a gated mid-rise community.', 'Survey No. 116/2, Baner Road', 'Baner', 'Behind High Street', 'Pune', 'Maharashtra', '411045', 'India', '2025-01-04T00:00:00.000Z', '2025-01-04T00:00:00.000Z'),
	('sita-crest', 'SS-006', 'SITA Crest', 'active', 'usr-manoj-verma', '2025-07-01', '2027-12-31', 24, 'Waterfront residential towers with retail frontage.', 'Plot 7, Rajiv Gandhi Salai', 'Sholinganallur', 'Near Sholinganallur Junction', 'Chennai', 'Tamil Nadu', '600119', 'India', '2025-01-03T00:00:00.000Z', '2025-01-03T00:00:00.000Z'),
	('sita-orchid', 'SS-007', 'SITA Orchid', 'on-hold', 'usr-sneha-kapoor', '2025-09-10', '2028-03-31', 14, 'Boutique residential project, currently on hold pending approvals.', 'Site 42, Sathy Road', 'Saravanampatti', 'Near Kumaraguru College', 'Coimbatore', 'Tamil Nadu', '641035', 'India', '2025-01-02T00:00:00.000Z', '2025-01-02T00:00:00.000Z'),
	('sita-riviera', 'SS-008', 'SITA Riviera', 'completed', 'usr-manoj-verma', '2022-05-01', '2025-08-15', 100, 'Completed beachside residential development, handed over.', 'Door No. 7-14, Beach Road', 'Maharani Peta', 'Near VMRDA Park', 'Visakhapatnam', 'Andhra Pradesh', '530002', 'India', '2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z');
