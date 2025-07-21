"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedReportTemplates = seedReportTemplates;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./logger"));
const prisma = new client_1.PrismaClient();
const reportTemplates = [
    {
        id: 'user-activity-report',
        name: 'User Activity Report',
        description: 'Report showing user activity and login statistics',
        template: {
            query: `
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.is_active,
          u.created_at,
          COUNT(al.id) as activity_count,
          MAX(al.created_at) as last_activity
        FROM users u
        LEFT JOIN audit_logs al ON u.id = al.user_id
        WHERE u.created_at >= '{{startDate}}'
          AND u.created_at <= '{{endDate}}'
          {{#if userRole}}AND u.role = '{{userRole}}'{{/if}}
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at
        ORDER BY u.created_at DESC
      `,
            parameters: [
                {
                    name: 'startDate',
                    type: 'date',
                    label: 'Start Date',
                    required: true,
                },
                {
                    name: 'endDate',
                    type: 'date',
                    label: 'End Date',
                    required: true,
                },
                {
                    name: 'userRole',
                    type: 'select',
                    label: 'User Role',
                    required: false,
                    options: [
                        { value: 'ADMIN', label: 'Administrator' },
                        { value: 'MANAGER', label: 'Manager' },
                        { value: 'USER', label: 'User' },
                        { value: 'VIEWER', label: 'Viewer' },
                    ],
                },
            ],
            format: 'pdf',
            htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{{title}}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .description { color: #666; margin-bottom: 10px; }
                .generated-at { font-size: 12px; color: #999; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .summary { background-color: #e8f4f8; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">User Activity Report</div>
                <div class="description">User activity and login statistics</div>
                <div class="generated-at">Generated on: {{generatedAt}}</div>
            </div>

            <div class="summary">
                <h3>Summary</h3>
                <p>Total Users: {{data.length}}</p>
            </div>

            {{#if data}}
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Activity Count</th>
                        <th>Last Activity</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each data}}
                    <tr>
                        <td>{{email}}</td>
                        <td>{{first_name}} {{last_name}}</td>
                        <td>{{role}}</td>
                        <td>{{#if is_active}}Active{{else}}Inactive{{/if}}</td>
                        <td>{{created_at}}</td>
                        <td>{{activity_count}}</td>
                        <td>{{last_activity}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            {{else}}
            <p>No data available for this report.</p>
            {{/if}}
        </body>
        </html>
      `,
        },
    },
    {
        id: 'data-records-report',
        name: 'Data Records Report',
        description: 'Report showing data records with filtering options',
        template: {
            query: `
        SELECT
          dr.id,
          dr.type,
          dr.version,
          dr.created_at,
          dr.updated_at,
          u1.email as created_by_email,
          u2.email as updated_by_email,
          CASE WHEN dr.deleted_at IS NOT NULL THEN 'Deleted' ELSE 'Active' END as status
        FROM data_records dr
        LEFT JOIN users u1 ON dr.created_by = u1.id
        LEFT JOIN users u2 ON dr.updated_by = u2.id
        WHERE 1=1
          {{#if recordType}}AND dr.type = '{{recordType}}'{{/if}}
          {{#if createdAfter}}AND dr.created_at >= '{{createdAfter}}'{{/if}}
          {{#unless includeDeleted}}AND dr.deleted_at IS NULL{{/unless}}
        ORDER BY dr.created_at DESC
      `,
            parameters: [
                {
                    name: 'recordType',
                    type: 'string',
                    label: 'Record Type',
                    required: false,
                },
                {
                    name: 'createdAfter',
                    type: 'date',
                    label: 'Created After',
                    required: false,
                },
                {
                    name: 'includeDeleted',
                    type: 'boolean',
                    label: 'Include Deleted Records',
                    required: false,
                    defaultValue: false,
                },
            ],
            format: 'pdf',
            htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Data Records Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .description { color: #666; margin-bottom: 10px; }
                .generated-at { font-size: 12px; color: #999; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .status-active { color: green; font-weight: bold; }
                .status-deleted { color: red; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Data Records Report</div>
                <div class="description">Data records with filtering options</div>
                <div class="generated-at">Generated on: {{generatedAt}}</div>
            </div>

            {{#if data}}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Version</th>
                        <th>Created By</th>
                        <th>Updated By</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each data}}
                    <tr>
                        <td>{{id}}</td>
                        <td>{{type}}</td>
                        <td>{{version}}</td>
                        <td>{{created_by_email}}</td>
                        <td>{{updated_by_email}}</td>
                        <td>{{created_at}}</td>
                        <td>{{updated_at}}</td>
                        <td class="{{#if (eq status 'Active')}}status-active{{else}}status-deleted{{/if}}">{{status}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            {{else}}
            <p>No data available for this report.</p>
            {{/if}}
        </body>
        </html>
      `,
        },
    },
    {
        id: 'audit-log-report',
        name: 'Audit Log Report',
        description: 'Security and audit log report',
        template: {
            query: `
        SELECT
          al.id,
          al.action,
          al.resource_type,
          al.resource_id,
          al.ip_address,
          al.created_at,
          u.email as user_email,
          u.first_name,
          u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.created_at >= '{{startDate}}'
          AND al.created_at <= '{{endDate}}'
          {{#if action}}AND al.action LIKE '%{{action}}%'{{/if}}
        ORDER BY al.created_at DESC
      `,
            parameters: [
                {
                    name: 'startDate',
                    type: 'date',
                    label: 'Start Date',
                    required: true,
                },
                {
                    name: 'endDate',
                    type: 'date',
                    label: 'End Date',
                    required: true,
                },
                {
                    name: 'action',
                    type: 'string',
                    label: 'Action Filter',
                    required: false,
                },
            ],
            format: 'pdf',
            htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Audit Log Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .description { color: #666; margin-bottom: 10px; }
                .generated-at { font-size: 12px; color: #999; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .action-create { color: green; }
                .action-update { color: blue; }
                .action-delete { color: red; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Audit Log Report</div>
                <div class="description">Security and audit log report</div>
                <div class="generated-at">Generated on: {{generatedAt}}</div>
            </div>

            {{#if data}}
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Resource Type</th>
                        <th>Resource ID</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each data}}
                    <tr>
                        <td>{{created_at}}</td>
                        <td>{{user_email}} ({{first_name}} {{last_name}})</td>
                        <td class="action-{{action}}">{{action}}</td>
                        <td>{{resource_type}}</td>
                        <td>{{resource_id}}</td>
                        <td>{{ip_address}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            {{else}}
            <p>No data available for this report.</p>
            {{/if}}
        </body>
        </html>
      `,
        },
    },
];
async function seedReportTemplates() {
    try {
        logger_1.default.info('Seeding report templates...');
        // Get the first admin user to use as creator
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });
        if (!adminUser) {
            logger_1.default.warn('No admin user found, skipping report template seeding');
            return;
        }
        for (const template of reportTemplates) {
            const existingTemplate = await prisma.report.findUnique({
                where: { id: template.id },
            });
            if (!existingTemplate) {
                await prisma.report.create({
                    data: {
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        template: template.template,
                        createdBy: adminUser.id,
                        isActive: true,
                    },
                });
                logger_1.default.info(`Created report template: ${template.name}`);
            }
            else {
                logger_1.default.info(`Report template already exists: ${template.name}`);
            }
        }
        logger_1.default.info('Report template seeding completed');
    }
    catch (error) {
        logger_1.default.error('Error seeding report templates:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run if called directly
if (require.main === module) {
    seedReportTemplates()
        .then(() => {
        console.log('Report templates seeded successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Error seeding report templates:', error);
        process.exit(1);
    });
}
