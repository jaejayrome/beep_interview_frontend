import CustomInput from './components/async/CustomInput';
import CustomSyncInput from './components/sync/CustomSyncInput';

function App() {

  return (
    <div className="flex justify-center items-center bg-gray-100 h-screen w-screen  overflow-hidden">
        <div className='flex flex-col space-y-8 p-6 rounded-md bg-white'> 
          <CustomInput type = "Async" topText = "Async Search" bottomText = "With description and custom results display"/>
          <CustomSyncInput type = "Sync" topText = "Sync Search" bottomText = "With default display and search on focus"/>
        </div>
      
    </div>
  );
}

export default App;
