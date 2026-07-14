import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResumeUpload = ({
  setQuestions,
  setShowQuestionsUI,
  showToast,
  setTransitionLoading,
  setTransitionText,
  setLoading,
}) => {

  const navigate = useNavigate();

  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);

  // Function 1 - Drag & Drop
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    setFile(uploadedFile);

    if (uploadedFile.type === "application/pdf") {
      readPdf(uploadedFile);
    } else {
      alert("Upload PDF file");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  // Function 2 - Read PDF
  const readPdf = async (file) => {
    const reader = new FileReader();

    reader.onload = async function () {
      const array = new Uint8Array(this.result);

      const pdf = await pdfjsLib.getDocument({
        data: array,
      }).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        const strings = content.items.map((item) => item.str);

        text += strings.join(" ");
      }

      setResumeText(text);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function 3 - Analyze Resume
  const analyzeInterview = async () => {

    if (!resumeText) {
      alert("Please upload your resume first!");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login to continue", "error");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

      return;
    }

    setTransitionText("Generating interview questions...");
    setTransitionLoading(true);

    try {

      const response = await fetch("http://localhost:3007/analyze", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          text: resumeText,
        }),
      });

      const data = await response.json();

      if (data.success) {

        const parsedQuestions = JSON.parse(data.analysis);

        setQuestions(parsedQuestions);

        setTransitionLoading(false);

        setShowQuestionsUI(true);
      }

    } catch (error) {

      console.error(error);

      setLoading(false);

      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen">

      <div className="grid grid-cols-1 md:grid-cols-6 bg-white">

        {/* LEFT */}

        <div className="hidden md:flex md:col-span-2 flex-col items-center px-10 py-14 border-r border-gray-200 bg-gradient-to-b from-sky-50 to-white">

          <img
            src="resumebluetheme.png"
            className="rounded-xl w-full max-w-xs shadow-lg object-contain"
            alt=""
          />

          {/* <p className="mt-8 text-[11px] text-gray-400 font-semibold tracking-widest uppercase">
            Powered by AI Analysis
          </p> */}

        </div>

        {/* RIGHT */}

        <div className="md:col-span-4 px-8 md:px-14 py-14 flex flex-col">

          <h1 className="text-4xl font-bold text-gray-500 mb-3 md:ms-30">
            Upload Your Resume
          </h1>

          <p className="text-gray-600 max-w-xl mb-10 md:ms-30">
            Upload your resume to receive AI-generated interview questions based on your skills, project,experience
          </p>

          <div
            {...getRootProps()}
            className="border-2 border-dashed border-sky-300 rounded-xl h-[38vh] max-w-2xl w-full mx-auto flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50"
          >

            <input {...getInputProps()} />

            <img src="blue border.png" className="w-28 mb-4 opacity-30 grayscale brightness-125" alt="" />

            <p className="font-semibold text-gray-500">
              Upload your resume
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Drag & Drop or Click to Upload
            </p>

          </div>

          {file && (
            <p className="text-center text-green-600 mt-4">
              ✅ {file.name}
            </p>
          )}

          <button
            onClick={analyzeInterview}
            className="mt-8 self-center bg-sky-400 text-white px-10 py-4 rounded-lg hover:bg-sky-500"
          >
            Generate Questions
          </button>

        </div>

      </div>

    </div>
  );
};

export default ResumeUpload;

