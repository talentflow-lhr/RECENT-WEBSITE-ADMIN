import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { supabase } from "./supabaseClient";

interface DeploymentApplicant {
  processing_id: number;
  application_id: number;
  app_first_name: string;
  app_last_name: string;
  position: string;
  company: string;
  jo_code: string;
  jo_id: number;
  medicalStatus: string | null;
  biometricStatus: string | null;
  visaApproval: string | null;
  insurance: string | null;
  pdos: string | null;
  oec: string | null;
  requestTicket: string | null;
  briefedContract: string | null;
  deploymentDate: string;
  processStatus: string | null;
}

export default function PreDeploymentChecklist({
  darkMode = false, hasPermission
}: {
  darkMode?: boolean; hasPermission: boolean
}) {
  const [deploymentApplicants, setDeploymentApplicants] = useState<
    DeploymentApplicant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobOrder, setFilterJobOrder] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  const fetchDeploymentData = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_processing")
      .select(`
        processing_id,
        application_id,
        process_medical_status,
        process_biometrics_status,
        process_visa_stamping,
        process_insurance,
        process_pdos,
        process_oec,
        process_req_ticket,
        process_brief_clear_contract,
        process_deploy_date,
        process_status,
        t_applications(
          application_id,
          application_current_status,
          t_applicant(app_first_name, app_last_name),
          t_job_positions(
            job_title,
            t_job_orders(
              jo_id,
              company_id,
              t_companies(company_name)
            )
          )
        )
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load deployment data.");
      setLoading(false);
      return;
    }

    // Also fetch accepted applicants that don't have a processing record yet
    const { data: acceptedData, error: acceptedError } = await supabase
      .from("t_applications")
      .select(
        `
        application_id,
        application_current_status,
        t_applicant(app_first_name, app_last_name),
        t_job_positions(
          job_title,
          t_job_orders(
            jo_id,
            company_id,
            t_companies(company_name)
          )
        )
      `,
      )
      .eq("application_current_status", "Accepted");

    if (acceptedError) {
      console.error(acceptedError);
    }

    // Get existing processing application_ids
    const existingIds = new Set((data || []).map((r: any) => r.application_id));

    // Map existing processing records
    const fromProcessing: DeploymentApplicant[] = (data || []).map(
      (row: any) => ({
        processing_id: row.processing_id,
        application_id: row.application_id,
        app_first_name: row.t_applications?.t_applicant?.app_first_name || "",
        app_last_name: row.t_applications?.t_applicant?.app_last_name || "",
        position: row.t_applications?.t_job_positions?.job_title || "",
        company:
          row.t_applications?.t_job_positions?.t_job_orders?.t_companies
            ?.company_name || "",
        jo_code: `JO-${String(row.t_applications?.t_job_positions?.t_job_orders?.jo_id || 0).padStart(5, "0")}`,
        jo_id: row.t_applications?.t_job_positions?.t_job_orders?.jo_id || 0,
        medicalStatus: row.process_medical_status,
        biometricStatus: row.process_biometrics_status,
        visaApproval: row.process_visa_stamping,
        insurance: row.process_insurance,
        pdos: row.process_pdos,
        oec: row.process_oec,
        requestTicket: row.process_req_ticket,
        briefedContract: row.process_brief_clear_contract,
        deploymentDate: row.process_deploy_date || "",
        processStatus: row.process_status,
      }),
    );

    // Map accepted applicants without processing records
    const fromAccepted: DeploymentApplicant[] = (acceptedData || [])
      .filter((row: any) => !existingIds.has(row.application_id))
      .map((row: any) => ({
        processing_id: -1, // not yet in DB
        application_id: row.application_id,
        app_first_name: row.t_applicant?.app_first_name || "",
        app_last_name: row.t_applicant?.app_last_name || "",
        position: row.t_job_positions?.job_title || "",
        company:
          row.t_job_positions?.t_job_orders?.t_companies?.company_name || "",
        jo_code: `JO-${String(row.t_job_positions?.t_job_orders?.jo_id || 0).padStart(5, "0")}`,
        jo_id: row.t_job_positions?.t_job_orders?.jo_id || 0,
        medicalStatus: null,
        biometricStatus: null,
        visaApproval: null,
        insurance: null,
        pdos: null,
        oec: null,
        requestTicket: null,
        briefedContract: null,
        deploymentDate: "",
        processStatus: null,
      }));

    setDeploymentApplicants([...fromProcessing, ...fromAccepted]);
    setLoading(false);
  };

  const handleFieldChange = async (
    applicant: DeploymentApplicant,
    field: string,
    value: string,
  ) => {
    const fieldMap: Record<string, string> = {
      deploymentDate: "process_deploy_date",
    };

    const dbField = fieldMap[field];
    if (!dbField) return;

    setDeploymentApplicants((prev) =>
      prev.map((a) =>
        a.application_id === applicant.application_id
          ? { ...a, [field]: value }
          : a,
      ),
    );

    if (applicant.processing_id === -1) {
      const { data: newRecord, error: insertError } = await supabase
        .from("t_processing")
        .insert({
          application_id: applicant.application_id,
          [dbField]: value,
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        return;
      }

      setDeploymentApplicants((prev) =>
        prev.map((a) =>
          a.application_id === applicant.application_id
            ? { ...a, processing_id: newRecord.processing_id }
            : a,
        ),
      );
    } else {
      const { error: updateError } = await supabase
        .from("t_processing")
        .update({ [dbField]: value })
        .eq("processing_id", applicant.processing_id);

      if (updateError) console.error(updateError);
    }
  };

  const getStatusValue = (val: string | null) => {
    if (!val) return false;
    return (
      val.toLowerCase() === "done" ||
      val.toLowerCase() === "yes" ||
      val === "1" ||
      val.toLowerCase() === "complete"
    );
  };

  const handleCheckboxChange = async (
    applicant: DeploymentApplicant,
    field: string,
  ) => {
    const current = (applicant as any)[field];
    const newValue = getStatusValue(current) ? "Pending" : "Done";

    // Build updated applicant to check if all done
    const updatedApplicant = { ...applicant, [field]: newValue };
    const allDone = [
      updatedApplicant.medicalStatus,
      updatedApplicant.biometricStatus,
      updatedApplicant.visaApproval,
      updatedApplicant.insurance,
      updatedApplicant.pdos,
      updatedApplicant.oec,
      updatedApplicant.requestTicket,
      updatedApplicant.briefedContract,
    ].every((val) => getStatusValue(val));

    const newProcessStatus = allDone ? "Complete" : "Pending";

    // Update local state immediately
    setDeploymentApplicants((prev) =>
      prev.map((a) =>
        a.application_id === applicant.application_id
          ? { ...a, [field]: newValue, processStatus: newProcessStatus }
          : a,
      ),
    );

    const fieldMap: Record<string, string> = {
      medicalStatus: "process_medical_status",
      biometricStatus: "process_biometrics_status",
      visaApproval: "process_visa_stamping",
      insurance: "process_insurance",
      pdos: "process_pdos",
      oec: "process_oec",
      requestTicket: "process_req_ticket",
      briefedContract: "process_brief_clear_contract",
    };

    const dbField = fieldMap[field];

    if (applicant.processing_id === -1) {
      // Create new processing record
      const { data: newRecord, error: insertError } = await supabase
        .from("t_processing")
        .insert({
          application_id: applicant.application_id,
          [dbField]: newValue,
          process_status: newProcessStatus,
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        return;
      }

      setDeploymentApplicants((prev) =>
        prev.map((a) =>
          a.application_id === applicant.application_id
            ? { ...a, processing_id: newRecord.processing_id }
            : a,
        ),
      );
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from("t_processing")
        .update({ [dbField]: newValue, process_status: newProcessStatus })
        .eq("processing_id", applicant.processing_id);

      if (updateError) console.error(updateError);
    }
  };

  const getPreDeploymentStatus = (applicant: DeploymentApplicant) => {
    const allDone = [
      applicant.medicalStatus,
      applicant.biometricStatus,
      applicant.visaApproval,
      applicant.insurance,
      applicant.pdos,
      applicant.oec,
      applicant.requestTicket,
      applicant.briefedContract,
    ].every((val) => getStatusValue(val));
    return allDone ? "Complete" : "Incomplete";
  };

  const uniqueJobOrders = Array.from(
    new Set(deploymentApplicants.map((a) => a.jo_code)),
  ).sort();
  const uniquePositions = Array.from(
    new Set(deploymentApplicants.map((a) => a.position)),
  ).sort();

  const filteredApplicants = deploymentApplicants.filter((applicant) => {
    const fullName =
      `${applicant.app_first_name} ${applicant.app_last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jo_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobOrder =
      filterJobOrder === "All" || applicant.jo_code === filterJobOrder;
    const matchesPosition =
      filterPosition === "All" || applicant.position === filterPosition;
    return matchesSearch && matchesJobOrder && matchesPosition;
  });

  function exportPredeploymentTableToExcel() {
    const dataType = 'application/vnd.ms-excel';
    const originalTable = document.getElementById('predeployment_table');
    if (!originalTable) return;

    // 1. Deep‑clone the table
    const tableClone = originalTable.cloneNode(true) as HTMLTableElement;

    // ----- 2. Split the header: "Company / Job Order" → "Company" + "Job Order" -----
    const theadRow = tableClone.querySelector('thead tr');
    if (theadRow) {
      const allTh = theadRow.querySelectorAll('th');
      const oldTh = allTh[2];   // 3rd <th> (index 2)
      if (oldTh) {
        const companyTh = document.createElement('th');
        companyTh.className = oldTh.className;
        companyTh.textContent = 'Company';

        const jobOrderTh = document.createElement('th');
        jobOrderTh.className = oldTh.className;
        jobOrderTh.textContent = 'Job Order';

        oldTh.replaceWith(companyTh, jobOrderTh);
      }
    }

    // ----- 3. Process body rows using the ORIGINAL table for live values -----
    const originalRows = originalTable.querySelectorAll('tbody tr');
    const clonedRows = tableClone.querySelectorAll('tbody tr');

    clonedRows.forEach((row, index) => {
      // Empty‑state row
      const emptyCell = row.querySelector('td[colspan]');
      if (emptyCell) {
        emptyCell.setAttribute('colspan', '14');  // updated column count
        return;
      }

      // a) Name column: remove the avatar <div> (first div inside the flex wrapper)
      const nameCell = row.querySelector('td');               // first cell
      if (nameCell) {
        const avatarDiv = nameCell.querySelector('div > div'); // inner avatar circle
        if (avatarDiv) avatarDiv.remove();
      }

      // b) Company / Job Order: split the third cell (index 2) into two
      const allCells = Array.from(row.querySelectorAll('td'));  // live after name removal
      if (allCells.length >= 3) {
        const originalCell = allCells[2]; // the combined cell
        const divs = originalCell.querySelectorAll('div');

        let companyText = '—';
        let jobOrderText = '—';
        if (divs.length >= 2) {
          companyText = divs[0].textContent?.trim() || '—';
          jobOrderText = divs[1].textContent?.trim() || '—';
        } else if (divs.length === 1) {
          companyText = divs[0].textContent?.trim() || '—';
        }

        const companyCell = document.createElement('td');
        companyCell.className = originalCell.className;
        companyCell.textContent = companyText;

        const jobOrderCell = document.createElement('td');
        jobOrderCell.className = originalCell.className;
        jobOrderCell.textContent = jobOrderText;

        originalCell.replaceWith(companyCell, jobOrderCell);
      }

      // c) Checkboxes: replace each with "Yes"/"No" based on ORIGINAL checked state
      const originalRow = originalRows[index];
      if (originalRow) {
        const originalCheckboxes = originalRow.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"]'
        );
        const clonedCheckboxes = row.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

        clonedCheckboxes.forEach((cb, i) => {
          const isChecked = originalCheckboxes[i]?.checked ?? false;
          cb.replaceWith(document.createTextNode(isChecked ? 'Yes' : 'No'));
        });

        // d) Deployment date: replace input with its current value
        const originalDateInput = originalRow.querySelector<HTMLInputElement>(
          'input[type="date"]'
        );
        const clonedDateInput = row.querySelector<HTMLInputElement>('input[type="date"]');
        if (originalDateInput && clonedDateInput) {
          const dateValue = originalDateInput.value || '';
          clonedDateInput.replaceWith(document.createTextNode(dateValue));
        }
      }
    });

    // ----- 4. Export -----
    const tableHTML = tableClone.outerHTML;
    const filename = `predeployment_table ${new Date().toISOString().slice(0, 19)}.xls`;

    if (navigator.msSaveOrOpenBlob) {
      const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
      navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading deployment data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Pre-Deployment Checklist
          </h1>
          <p
            className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Track deployment requirements for accepted applicants
          </p>
        </div>
        <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            onClick={exportPredeploymentTableToExcel}
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, position, company, or job order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label
              className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Filter by Job Order
            </label>
            <select
              value={filterJobOrder}
              onChange={(e) => setFilterJobOrder(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="All">All Job Orders</option>
              {uniqueJobOrders.map((jo) => (
                <option key={jo} value={jo}>
                  {jo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Filter by Position
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="All">All Positions</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full" id="predeployment_table">
            <thead className="bg-green-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  <div>Company</div>
                  <div className="text-center normal-case">Job Order</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Medical
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Biometric
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  VISA Approval
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  PDOS
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  OEC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Request Ticket
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Briefed Contract
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Pre-Deployment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Deployment Date
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"}`}
            >
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No applicants found
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const preDeploymentStatus = getPreDeploymentStatus(applicant);
                  const checkboxFields = [
                    { key: "medicalStatus", val: applicant.medicalStatus },
                    { key: "biometricStatus", val: applicant.biometricStatus },
                    { key: "visaApproval", val: applicant.visaApproval },
                    { key: "insurance", val: applicant.insurance },
                    { key: "pdos", val: applicant.pdos },
                    { key: "oec", val: applicant.oec },
                    { key: "requestTicket", val: applicant.requestTicket },
                    { key: "briefedContract", val: applicant.briefedContract },
                  ];

                  return (
                    <tr
                      key={applicant.application_id}
                      className={`transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                          >
                            <span className="text-green-600 font-semibold text-xs">
                              {applicant.app_first_name[0]}
                              {applicant.app_last_name[0]}
                            </span>
                          </div>
                          <div
                            className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {applicant.app_first_name} {applicant.app_last_name}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                      >
                        {applicant.position}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {applicant.company}
                        </div>
                        <div
                          className={`text-xs font-mono text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {applicant.jo_code}
                        </div>
                      </td>

                      {/* Checkboxes */}
                      {checkboxFields.map(({ key, val }) => (
                        <td
                          key={key}
                          className="px-4 py-4 whitespace-nowrap text-center"
                        >
                          <input
                            type="checkbox"
                            checked={getStatusValue(val)}
                            onChange={() =>
                              handleCheckboxChange(applicant, key)
                            }
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer accent-green-600"
                            disabled={!hasPermission}
                          />
                        </td>
                      ))}

                      {/* Pre-Deployment Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            preDeploymentStatus === "Complete"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {preDeploymentStatus}
                        </span>
                      </td>

                      {/* Deployment Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={applicant.deploymentDate || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              applicant,
                              "deploymentDate",
                              e.target.value,
                            )
                          }
                          className={`px-2 py-1 border rounded focus:outline-none focus:border-green-600 text-sm ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          disabled={!hasPermission}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div
        className={`rounded-lg shadow-md p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex justify-between items-center">
          <div
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Total Applicants:{" "}
            <span
              className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {filteredApplicants.length}
            </span>
          </div>
          <div className="flex space-x-6">
            <div
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Complete:{" "}
              <span className="font-semibold text-green-600">
                {
                  filteredApplicants.filter(
                    (app) => getPreDeploymentStatus(app) === "Complete",
                  ).length
                }
              </span>
            </div>
            <div
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Incomplete:{" "}
              <span className="font-semibold text-yellow-600">
                {
                  filteredApplicants.filter(
                    (app) => getPreDeploymentStatus(app) === "Incomplete",
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
