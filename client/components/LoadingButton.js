import Button from 'react-bootstrap/Button'

export default function LoadingButton(props) {
    return (
        <Button {...props} disabled={props.isLoading}>
            {props.isLoading ? 'Loading...' : props.children}
        </Button>
    )
}
