const Loading = ({ color }: { color?: "white" }) => {
    return (
        <>
            {color === "white" ? (
                <div className="ispinner-w">
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                    <div className="ispinner-w-blade"></div>
                </div>
            ) : (
                <div className="ispinner">
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                    <div className="ispinner-blade"></div>
                </div>
            )}
        </>
    );
};

export default Loading;
