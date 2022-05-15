import Button from 'react-bootstrap/Button'
import PropTypes from 'prop-types'

export default function LoadingButton({ isLoading, children, ...otherProps }) {
    return (
        <Button {...otherProps} disabled={isLoading}>
            {isLoading ? 'Loading...' : children}
        </Button>
    )
}

LoadingButton.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
}
