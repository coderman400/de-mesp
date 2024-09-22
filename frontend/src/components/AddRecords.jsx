import { useNavigate } from 'react-router-dom';

const AddRecords = () => {
  const navigate = useNavigate();

  const goToBloodReport = () => navigate('/addrecords/blood-report');
  const goToDiagnosis = () => navigate('/addrecords/diagnosis');
  const goToPhysicalCheckup = () => navigate('/addrecords/physical-checkup');

  return (
    <div className='text-center w-screen'>
      <h1 className='font-extrabold text-4xl'>Add Records</h1>
      <div className='m-8'>
        <button onClick={goToBloodReport} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#7EB77F] hover:bg-[#D6D5B3] ease-linear duration-75'>
          Blood Report
        </button>
        <button onClick={goToDiagnosis} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#D6D5B3] hover:bg-[#F5DBCB] ease-linear duration-75'>
          Diagnosis
        </button>
        <button onClick={goToPhysicalCheckup} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#ED7B84] hover:bg-[#F92A82] ease-linear duration-75'>
          Physical Checkup
        </button>
      </div>
    </div>
  );
};

export default AddRecords;
