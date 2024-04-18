Dim sFileName
Dim objFSO 
Dim ORDERLINES,ORDERLINE
Dim SCONN
Dim RS
Dim woTemplate

' ****************************************************************************************
' Set the Work Order template to copy when creating the linked work order
' Change This variable to match the BASE_ID of the Engineering Master
' ****************************************************************************************
woTemplate="CUSTOM"

SALESREP_ID=USER
USER_3=USER
UDF_LAYOUT_ID="Work orders"

Set SCONN = CreateObject("ADODB.Connection")
Set RS = CreateObject("ADODB.Recordset")
Set POLB = CreateObject("ADODB.Recordset")

IF CUSTOMER_ID<>"" THEN
  
  SCONN.Open "Provider=sqloledb;Data Source=UNI-SQL01;Initial Catalog=" & DATABASE & ";User Id=MACRO;Password=Macro123"
  Set RS=SCONN.EXECUTE("SELECT NAME FROM CUSTOMER WHERE ID='" & CUSTOMER_ID & "'")
  IF NOT RS.EOF THEN
    USER_2=RS("NAME")
  END IF
  
END IF

Set objFSO = CreateObject("Scripting.FileSystemObject")

strPath = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\"
sub_folder1 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Accounting\"
sub_folder2 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Correspondence\"
sub_folder3 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Engineering\"
sub_folder4 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Quality\"
sub_folder5 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Quotations\"
sub_folder6 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Correspondence\Vendor"
sub_folder7 = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Correspondence\Customer"

'Recursive folder create, will create directories and Sub
Createfolder( strpath)
Createfolder( sub_folder1 )
Createfolder( sub_folder2 )
Createfolder( sub_folder3 )
Createfolder( sub_folder4 )
Createfolder( sub_folder5 )
Createfolder( sub_folder6 )
Createfolder( sub_folder7 )

'copy quote spreadsheet to quotations sub-folder
sFileName = Quote_ID & ".REV.00." & AsciiOnly(NAME) &  ".xlsm"
sPathAndFile = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Quotations\" & sFileName
If Not(objFSO.FileExists(sPathAndFile)) Then
  objFSO.CopyFile "\\charlie\Corporate Data\Unified\Projects\UEQuote.xlsm",sPathAndFile,False
End If

'copy quote spreadsheet for each additional line if present
'Set ORDERLINES = LINES.Value
'For i = 0 To ORDERLINES.Count -1
'  Set ORDERLINE = ORDERLINES(i)
'  If ORDERLINE("LINE_NO") > 1 Then
'    sFileName = Quote_ID & ".LN." & ORDERLINE("LINE_NO") & ".REV.00." & AsciiOnly(NAME) & "." & AsciiOnly(CONTACT_FIRST_NAME) & "_" & AsciiOnly(CONTACT_LAST_NAME) & ".xlsm"
'    sPathAndFile = "\\charlie\Corporate Data\" & DATABASE & "\Projects\" & Quote_ID & "\Quotations\" & sFileName
'    If Not(objFSO.FileExists(sPathAndFile)) Then
'      objFSO.CopyFile "\\charlie\Corporate Data\Unified\Projects\UEQuote.xlsm",sPathAndFile,False
'    End If
'  End if
'  Set ORDERLINE = Nothing
'Next  
'Set ORDERLINES = Nothing

IF (DATABASE = "UNIFIED" OR DATABASE ="SANDBOX" OR DATABASE = "UNIDEV") THEN

Const adParamInput = &H0001
Const adVarChar = 200

Dim strServerName
Dim strDatabase
Dim strUserName
Dim strPassword


strServerName="UNI-SQL01"
strDatabase=DATABASE
strUserName="MACRO"
strPassword="Macro123"

strcnn="Driver={SQL Server};Server=" & strServerName & ";Database=" & strDatabase & ";Uid=" & strUsername & ";Pwd=" & strPassword & ";"

Set Conn = CreateObject("ADODB.Connection")
conn.open strcnn

Set Cmd = CreateObject("ADODB.Command")
Cmd.ActiveConnection = conn

Cmd.CommandText = "SR_SP_CUSTOMER_ORDER_QUOTE @I_QTID='" & QUOTE_ID & "' , @I_SITE_ID='" & SITE_ID & "' , @WO_TEMPLATE='" & woTemplate & "'"
Cmd.Execute

END IF

Sub CreateFolder ( strpath)
  On Error Resume Next
  If strPath <> "" Then 'Fixes endless recursion in some instances when at lowest directory
    If Not objFSO.FolderExists( objFSO.GetParentFolderName(strPath) ) then Call CreateFolder(objFSO.GetParentFolderName(strPath) )
    objFSO.CreateFolder( strPath )
  End If
End Sub

Function AsciiOnly(Value)
  Dim i, sName
  For i = 1 to Len(Value)
    If ((Asc(Mid(Value,i,1)) >= 48) and (Asc(Mid(Value,i,1)) <= 57)) _ 
      or ((Asc(Mid(Value,i,1)) >= 65) and (Asc(Mid(Value,i,1)) <= 90)) _
      or ((Asc(Mid(Value,i,1)) >= 97) and (Asc(Mid(Value,i,1)) <= 122)) then
        sName =  sName & Mid(Value,i,1)
    End if
  Next
  AsciiOnly = sName
End function