SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'dbo.UNI_LABOR_TICKET', N'U') IS NULL

CREATE TABLE [dbo].[UNI_LABOR_TICKET] (
	[TRANSACTION_ID] [int] IDENTITY(1,1) NOT NULL,
	[CREATE_DATE] [datetime] NOT NULL default CURRENT_TIMESTAMP,
	[TRANSACTION_DATE] [datetime] NOT NULL default CURRENT_TIMESTAMP,
	[WORKORDER_TYPE] [nchar](1) NULL,
	[WORKORDER_BASE_ID] [nvarchar](30) NULL,
	[WORKORDER_LOT_ID] [nvarchar](3) NULL,
	[WORKORDER_SPLIT_ID] [nvarchar](3) NULL,
	[WORKORDER_SUB_ID] [nvarchar](3) NULL,
	[OPERATION_SEQ_NO] [smallint] NULL,
	[TYPE] [nchar](1) NOT NULL, -- INDIRECT, DIRECT, SETUP
	[TYPE_STRING] [nvarchar] (25) NOT NULL, 
	[EMPLOYEE_ID] [nvarchar](15) NOT NULL,
	[RESOURCE_ID] [nvarchar](15) NULL,
	[CLOCK_IN] [datetime] NULL,
	[CLOCK_OUT] [datetime] NULL,
	[HOURS_WORKED] [decimal](7, 2) NULL,
	[HOURS_BREAK] [decimal](7, 2) NULL,
	
	[DESCRIPTION] [nvarchar](80) NULL,
	[INDIRECT_CODE] [nchar](1) NOT NULL,
	[INDIRECT_ID] [nvarchar](15) NULL,

	[UDF1] [nvarchar](80) NULL,
	[UDF2] [nvarchar](80) NULL,
	[UDF3] [nvarchar](80) NULL,
	[UDF4] [nvarchar](80) NULL,

	
	[APPROVED] [NCHAR](1) NOT NULL,
	[APPROVED_BY] [nvarchar] (25) NULL,
	[APPROVED_AT] [datetime] NULL

);
GO