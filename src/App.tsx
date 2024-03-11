import { useState } from 'react';
import * as yup from 'yup';

import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Button, Stack } from '@mui/material';
import { DataGrid, GridCellEditStopParams, GridColDef, MuiEvent } from '@mui/x-data-grid';

import { FormProvider, FormRadioGroup, FormSubmitButton, FormTextInput, useForm, useFormConfig } from "@hilma/forms"
import { provide } from '@hilma/tools';

import { exportToXlsx } from './functions/export-to-xlsx.function';
import { useLocalStorage } from '@uidotdev/usehooks';

import './App.scss'

type Guest = {
  id: string,
  fullName: string,
  description?: string,
  side?: string,
  relation?: string,
}

const GuestSchema = yup.object().shape({
  firstName: yup.string().min(2, "שדה זה חייב להכיל לפחות 2 תווים").required("שדה זה הינו חובה"),
  lastName: yup.string().min(2, "שדה זה חייב להכיל לפחות 2 תווים").required("שדה זה הינו חובה"),
  description: yup.string(),
  side: yup.string(),
  relation: yup.string(),
}).required();

type GuestForm = yup.InferType<typeof GuestSchema>;

const sides = ["צד כלה", "צד חתן"];
const relations = ["משפחה", "חברים", "חברים של הורים"];

const App: React.FC = () => {
  const [guests, setGuests] = useLocalStorage<Guest[]>("guests", []);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const { resetForm } = useForm();

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'שם מלא',
      width: 150,
      editable: true,
    },
    {
      field: 'description',
      headerName: 'תיאור',
      width: 150,
      editable: true,
    },
    {
      field: 'side',
      headerName: 'צד',
      width: 150,
      editable: true,
    },
    {
      field: 'relation',
      headerName: 'קירבה',
      width: 150,
      editable: true,
    }
  ]

  useFormConfig<GuestForm>((form) => {
    form.onSubmit = handleFormSubmit;
  }, [setGuests])

  function handleDelete() {
    setGuests(prev => prev.filter(guest => !selectedGuests.includes(guest.id)))
    setSelectedGuests([])
  }

  function handleCellEdit(params: GridCellEditStopParams, e: MuiEvent) {
    setGuests(prev => {
      const event = e as React.ChangeEvent<HTMLTextAreaElement>
      const tempGuests = structuredClone(prev);
      const guestIndex = tempGuests.findIndex(guest => guest.id === params.id);
      tempGuests[guestIndex][params.field as keyof Guest] = event.target.value;
      return tempGuests;
    })
  }

  function handleFormSubmit(values: GuestForm) {
    const { firstName, lastName, side, relation, description } = values;
    setGuests(prev => [...prev, { id: crypto.randomUUID(), fullName: `${firstName} ${lastName}`, side, relation, description }])
    resetForm();
  }

  function convertToHebrew(guests: Guest[]) {
    return guests.map(guest => ({
      "שם מלא": guest.fullName,
      "תיאור": guest.description,
      "צד": guest.side,
      "קירבה": guest.relation
    }))
  }

  return (
    <>
      <h1 className='title'>מוזמנים - בר ולשם </h1>
      <Stack width="100%" height="100%" flexDirection="row" gap="5%" justifyContent="center" alignItems="center">
        <Stack height="80%">
          <FormTextInput name="firstName" label="שם פרטי" />
          <FormTextInput name="lastName" label="שם משפחה" />
          <FormTextInput name="description" label="תיאור" />
          <FormRadioGroup
            name="side"
            options={sides.map(value => ({ value, content: value }))}
            sx={{ flexDirection: "row" }}
          />
          <FormRadioGroup
            name="relation"
            options={relations.map(value => ({ value, content: value }))}
            sx={{ flexDirection: "row" }}
          />
          <FormSubmitButton children="הוספה" variant='outlined' />
        </Stack>
        <Stack position="relative" height="80%" className='table_container'>
          <DataGrid
            rows={guests}
            columns={columns}
            onCellEditStop={handleCellEdit}
            onRowSelectionModelChange={(selectedGuests) => setSelectedGuests(selectedGuests as string[])}
            hideFooterPagination
            checkboxSelection
          />
          {selectedGuests.length &&
            <IconButton sx={{ position: "absolute", top: "2%", right: "2%" }} onClick={handleDelete} >
              <DeleteIcon />
            </IconButton>
          }
        </Stack>
        <Stack height="30%" gap="10%">
          <Button color='primary' variant='outlined' onClick={() => exportToXlsx(convertToHebrew(guests))} >
            ייצוא לאקסל
          </Button>
          <Button color='primary' variant='outlined' onClick={() => setGuests([])}>
            אפס טבלה
          </Button>
        </Stack>
      </Stack>
    </>
  )
}

export default provide([FormProvider<GuestForm>, {
  initialValues: { firstName: "", lastName: "", side: "", relation: "", description: "" },
  onSubmit: () => { },
  className: "guests_form",
  validationSchema: GuestSchema,
  enableReinitialize: true
}])(App)
