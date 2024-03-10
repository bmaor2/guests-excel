import './App.scss'
import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { exportToXlsx } from './functions/export-to-xlsx.function';
import { FormProvider, FormRadioGroup, FormSubmitButton, FormTextInput, useForm, useFormConfig } from "@hilma/forms"

import * as yup from 'yup';
import { provide } from '@hilma/tools';
import { useLocalStorage } from '@uidotdev/usehooks';

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
  const { resetForm } = useForm();

  useFormConfig<GuestForm>((form) => {
    form.onSubmit = handleFormSubmit;
  }, [setGuests])

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
        <Stack height="80%" className='table_container'>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>שם מלא</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell>צד</TableCell>
                <TableCell>קירבה</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{}}>
              {guests.map(({id, fullName, side, relation, description }) => (
                <TableRow key={id}>
                  <TableCell>{fullName}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>{side}</TableCell>
                  <TableCell>{relation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
