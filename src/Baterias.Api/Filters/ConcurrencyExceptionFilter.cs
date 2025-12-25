using Marten.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Baterias.Api.Filters;

public class ConcurrencyExceptionFilter : IExceptionFilter
{
    private readonly ILogger<ConcurrencyExceptionFilter> _logger;

    public ConcurrencyExceptionFilter(ILogger<ConcurrencyExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        if (context.Exception is ConcurrencyException concurrencyException)
        {
            _logger.LogWarning(concurrencyException, "Concurrency conflict detected");

            context.Result = new ConflictObjectResult(new
            {
                Error = "Conflict",
                Message = "El recurso ha sido modificado por otro usuario. Por favor, recargue y vuelva a intentarlo.",
                Detail = concurrencyException.Message
            });

            context.ExceptionHandled = true;
        }
    }
}
