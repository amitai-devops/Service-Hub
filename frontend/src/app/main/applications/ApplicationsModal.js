import AddIcon from '@mui/icons-material/Add';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { applicationInstall } from 'app/store/applicationsSlice';

import NamespacesSelect from './NamespacesSelect';
import TemplateInputs from './TemplateInputs/TemplateInputs';

const ApplicationsModal = ({
  openModal,
  setOpenModal,
  kubernetesConfiguration,
  setApplications,
  setAllApplications,
  templateFromCatalog,
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoMessageError, setInfoMessageError] = useState('');
  const [infoMessageSuccess, setInfoMessageSuccess] = useState('');
  const [cluster, setCluster] = useState('');
  const [namespace, setNamespace] = useState('');
  const [templateFormData, setTemplateFormData] = useState({});

  useEffect(() => {
    setCluster(kubernetesConfiguration[0]?.name);
  }, [kubernetesConfiguration]);

  useEffect(() => {
    if (openModal) {
      setOpen(true);
      setOpenModal(false);
    }
  }, [openModal]);

  const clearMessages = () => {
    setInfoMessageError('');
    setInfoMessageSuccess('');
  };

  const handleClickSaveButton = (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    if (e.target.form) {
      const { context_name, template_id, number, slider, text, textarea } = e.target.form;
      if (
        !context_name.value ||
        !template_id.value ||
        !number.value ||
        !slider.value ||
        !text.value ||
        !textarea.value
      ) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    inputRef.current.click();
  };

  const handleSubmitInstall = async (e) => {
    e.preventDefault();
    const { context_name, template_id } = e.target;
    const application = {
      template_id: template_id.value,
      inputs: templateFormData,
      context_name: context_name.value,
      namespace,
      dry_run: false,
    };
    const data = await dispatch(applicationInstall(application));

    if (data.payload.status === 'error') {
      setInfoMessageError(data.payload.message);
    } else {
      setInfoMessageSuccess('Application was successfully created');
      if (setApplications) {
        setApplications((applications) => [...applications, data.payload.application]);
        setAllApplications((applications) => [...applications, data.payload.application]);
      }
      setTimeout(() => {
        setOpen(false);
        clearMessages();
      }, 2000);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setLoading(false);
    setOpen(false);
    clearMessages();
  };

  const handleChangeSelect = (e) => {
    setCluster(e.target.value);
  };

  const handleGetNamespace = (value) => {
    setNamespace(value);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <form onSubmit={handleSubmitInstall}>
          <DialogTitle className='bg-primary text-center text-white'>Deploy Application</DialogTitle>
          <DialogContent className='pb-0  overflow-y-hidden'>
            <div className='mt-24'>Create a new applicaion</div>
            <TemplateInputs
              setTemplateFormData={setTemplateFormData}
              clearMessages={clearMessages}
              templateFromCatalog={templateFromCatalog}
            />
            <Box sx={{ minWidth: 120 }}>
              <FormControl margin='normal' fullWidth required>
                <InputLabel id='cluster'>Cluster</InputLabel>
                <Select
                  name='context_name'
                  labelId='cluster'
                  value={cluster}
                  required
                  label='Clusters'
                  onChange={handleChangeSelect}
                >
                  {kubernetesConfiguration.length &&
                    kubernetesConfiguration?.map((cluster) => (
                      <MenuItem key={cluster.name} value={cluster.name}>
                        {cluster.cluster}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
            <NamespacesSelect clusterContextName={cluster} handleGetNamespace={(value) => handleGetNamespace(value)} />
          </DialogContent>

          <DialogActions className='p-24 justify-between'>
            <div className='mr-10'>
              <div>{infoMessageError && <p className='text-red'>{infoMessageError}</p>}</div>
              <div>{infoMessageSuccess && <p className='text-green'>{infoMessageSuccess}</p>}</div>
            </div>
            <div className='flex'>
              <Button className='mr-14' onClick={handleClose}>
                Cancel
              </Button>
              <LoadingButton
                color='primary'
                onClick={handleClickSaveButton}
                loading={loading}
                loadingPosition='start'
                startIcon={<AddIcon />}
                variant='contained'
              >
                Deploy
              </LoadingButton>
              <input ref={inputRef} type='submit' className='hidden' />
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ApplicationsModal;
